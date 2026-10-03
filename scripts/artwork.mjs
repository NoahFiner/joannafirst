import sharp from 'sharp';
import { parse } from 'csv-parse/sync';
import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CATEGORIES = ['paintings', 'pastels', 'photos', 'homepage'];
const RECIPE = { version: 1, sharp: sharp.versions, thumbnail: 300, sizes: [800, 1600, 2400], quality: 88 };
const hash = buffer => createHash('sha256').update(buffer).digest('hex');
const json = value => JSON.stringify(value, null, 2) + '\n';
export const slug = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export function heroMarkup(hero, homepage) {
  const fallback = hero.variants.at(-1);
  const srcset = hero.variants.map(image => `${image.src} ${image.width}w`).join(', ');
  const ratio = fallback.width / fallback.height;
  const sizes = homepage ? `max(100vw, ${(100 * ratio).toFixed(2)}svh)` : `max(100vw, ${(500 * ratio).toFixed(2)}px)`;
  return `<!-- generated:hero:start -->\n          <img class="hero-image" src="${fallback.src}" srcset="${srcset}" sizes="${sizes}" width="${fallback.width}" height="${fallback.height}" alt="" aria-hidden="true" fetchpriority="high" decoding="async">\n          <!-- generated:hero:end -->`;
}
const exists = async file => fs.access(file).then(() => true, () => false);
async function readJSON(file) { return JSON.parse(await fs.readFile(file, 'utf8')); }
async function atomic(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const temporary = file + '.tmp';
  await fs.writeFile(temporary, value);
  await fs.rename(temporary, file);
}
function safeSource(root, relative) {
  const resolved = path.resolve(root, relative);
  if (path.isAbsolute(relative) || !resolved.startsWith(root + path.sep)) throw new Error(`Source must be inside the project: ${relative}`);
  return resolved;
}
export function validateCatalog(items) {
  if (!Array.isArray(items) || !items.length) throw new Error('Catalog must contain images.');
  const ids = new Set();
  for (const item of items) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id || '')) throw new Error(`Invalid ID: ${item.id}`);
    if (ids.has(item.id)) throw new Error(`Duplicate ID: ${item.id}`);
    ids.add(item.id);
    if (!CATEGORIES.includes(item.category)) throw new Error(`Invalid category for ${item.id}`);
    for (const key of ['title', 'source', ...(item.category === 'homepage' ? [] : ['medium', 'dimensions'])]) {
      if (typeof item[key] !== 'string' || !item[key].trim()) throw new Error(`Missing ${key} for ${item.id}`);
    }
    if (!Number.isFinite(item.order)) throw new Error(`Invalid order for ${item.id}`);
  }
}
export function parseBatch(text, base) {
  return parse(text, { columns: true, skip_empty_lines: true, bom: true, trim: true }).map(row => {
    if (!row.file) throw new Error('Every CSV row requires a file column.');
    return { ...row, file: path.resolve(base, row.file) };
  });
}

// Build immutable files first. Publish the complete manifest only after every image succeeds.
// Source metadata stays in catalog.json; generated paths/details stay in images.json.
export async function build(root = ROOT, { catalog, inputs = new Map(), dryRun = false } = {}) {
  root = path.resolve(root);
  catalog ??= await readJSON(path.join(root, 'data/catalog.json'));
  validateCatalog(catalog);
  const lockPath = path.join(root, '.image-build.lock');
  let lock;
  try { lock = await fs.open(lockPath, 'wx'); }
  catch (error) { if (error.code === 'EEXIST') throw new Error('Another image operation is running (.image-build.lock).'); throw error; }
  let stage;
  try {
    const previous = await readJSON(path.join(root, 'data/images.json')).catch(error => { if (error.code === 'ENOENT') return { images: [] }; throw error; });
    const old = new Map(previous.images.map(item => [item.id, item]));
    const images = [];
    let generated = 0, reused = 0;
    if (!dryRun) stage = await fs.mkdtemp(path.join(root, '.image-stage-'));
    for (const item of catalog) {
      safeSource(root, item.source);
      const bytes = await fs.readFile(inputs.get(item.source) || safeSource(root, item.source));
      const metadata = await sharp(bytes).metadata();
      if ((metadata.pages || 1) > 1) throw new Error(`Animated/multipage input is not supported: ${item.source}`);
      const digest = hash(bytes);
      const fingerprint = hash(Buffer.concat([Buffer.from(json(RECIPE)), bytes]));
      const cached = old.get(item.id);
      const outputs = cached ? [cached.thumbnail, ...cached.variants] : [];
      // Check contents, not just paths, so interrupted/corrupted outputs get rebuilt.
      const intact = cached?.fingerprint === fingerprint && outputs.length && (await Promise.all(outputs.map(async o => {
        try { return hash(await fs.readFile(safeSource(root, o.src))) === o.sha256; } catch { return false; }
      }))).every(Boolean);
      if (intact) {
        images.push({ ...item, sourceHash: digest, fingerprint, thumbnail: cached.thumbnail, variants: cached.variants });
        reused++;
        continue;
      }
      generated++;
      if (dryRun) {
        console.log(`Would generate ${item.id} from ${item.source} (${metadata.width}×${metadata.height})`);
        continue;
      }
      const folder = `images/generated/${item.id}/${fingerprint.slice(0, 16)}`;
      const outputDir = path.join(stage, folder);
      await fs.mkdir(outputDir, { recursive: true });
      async function exportSize(size, name, quality) {
        const filename = `${name}.webp`;
        // No crop, no enlargement; orientation and a consistent embedded sRGB profile.
        const { data, info } = await sharp(bytes).autoOrient().withIccProfile('srgb')
          .resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
          .webp({ quality, alphaQuality: 100, effort: 5 }).toBuffer({ resolveWithObject: true });
        await fs.writeFile(path.join(outputDir, filename), data);
        return { src: `${folder}/${filename}`, width: info.width, height: info.height, bytes: data.length, sha256: hash(data) };
      }
      const thumbnail = await exportSize(RECIPE.thumbnail, 'thumbnail', 84);
      const longest = Math.max(metadata.width, metadata.height);
      const sizes = [...new Set(RECIPE.sizes.map(size => Math.min(size, longest)))];
      const variants = [];
      for (const size of sizes) variants.push(await exportSize(size, `display-${size}`, RECIPE.quality));
      images.push({ ...item, sourceHash: digest, fingerprint, thumbnail, variants });
    }
    if (!dryRun) {
      // Copy incoming masters once, without overwriting an existing original.
      for (const [relative, source] of inputs) {
        const destination = safeSource(root, relative);
        await fs.mkdir(path.dirname(destination), { recursive: true });
        try { await fs.copyFile(source, destination, fs.constants.COPYFILE_EXCL); }
        catch (error) {
          if (error.code !== 'EEXIST' || hash(await fs.readFile(source)) !== hash(await fs.readFile(destination))) throw error;
        }
      }
      if (await exists(path.join(stage, 'images'))) await fs.cp(path.join(stage, 'images'), path.join(root, 'images'), { recursive: true });
      const catalogPath = path.join(root, 'data/catalog.json');
      const oldCatalog = await fs.readFile(catalogPath).catch(error => { if (error.code === 'ENOENT') return null; throw error; });
      try {
        await atomic(catalogPath, json(catalog));
        const hero = images.filter(item => item.category === 'homepage').sort((a, b) => a.order - b.order)[0];
        if (hero) {
          for (const page of ['index', 'statement', 'resume', 'contact']) {
            const file = path.join(root, `${page}.html`);
            if (!await exists(file)) continue;
            const html = await fs.readFile(file, 'utf8');
            const marker = /<!-- generated:hero:start -->[\s\S]*?<!-- generated:hero:end -->/;
            if (!marker.test(html)) throw new Error(`Missing generated hero markers in ${page}.html`);
            await atomic(file, html.replace(marker, heroMarkup(hero, page === 'index')));
          }
        }
        await atomic(path.join(root, 'data/images.json'), json({ schemaVersion: 1, images }));
      } catch (error) {
        if (oldCatalog) await atomic(catalogPath, oldCatalog);
        throw error;
      }
    }
    return { generated, reused, count: catalog.length };
  } finally {
    if (stage) await fs.rm(stage, { recursive: true, force: true });
    await lock.close();
    await fs.unlink(lockPath);
  }
}

export async function addEntries(root, entries, { dryRun = false } = {}) {
  const catalog = await readJSON(path.join(root, 'data/catalog.json'));
  const ids = new Set(catalog.map(item => item.id));
  const knownHashes = new Set();
  for (const item of catalog) knownHashes.add(hash(await fs.readFile(safeSource(root, item.source))));
  const inputs = new Map();
  for (const entry of entries) {
    const digest = hash(await fs.readFile(entry.file));
    if (knownHashes.has(digest)) throw new Error(`Duplicate image: ${entry.file}`);
    knownHashes.add(digest);
    const category = entry.category === 'photography' ? 'photos' : entry.category;
    const id = entry.id || `${category}-${slug(entry.title || '')}`;
    if (ids.has(id)) throw new Error(`ID already exists: ${id}. Supply a different id for another work with the same title.`);
    ids.add(id);
    const extension = path.extname(entry.file).toLowerCase();
    const source = `originals/${id}-${digest.slice(0, 12)}${extension}`;
    inputs.set(source, entry.file);
    const order = entry.order === undefined || entry.order === ''
      ? Math.max(-1, ...catalog.filter(item => item.category === category).map(item => item.order)) + 1 : Number(entry.order);
    catalog.push({ id, category, title: entry.title, medium: entry.medium || '', dimensions: entry.dimensions || '', description: entry.description || '', order, source });
  }
  return build(root, { catalog, inputs, dryRun });
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const positional = args.filter(arg => arg !== '--dry-run');
  if (command === 'build') console.log(await build(ROOT, { dryRun }));
  else if (command === 'batch') {
    if (!positional[0]) throw new Error('Usage: npm run artwork:batch -- artworks.csv [--dry-run]');
    const csv = path.resolve(positional[0]);
    console.log(await addEntries(ROOT, parseBatch(await fs.readFile(csv, 'utf8'), path.dirname(csv)), { dryRun }));
  } else if (command === 'add') {
    if (!positional[0]) throw new Error('Usage: npm run artwork:add -- /path/to/image.jpg [--dry-run]');
    if (!process.stdin.isTTY) throw new Error('Interactive import requires a terminal; use artwork:batch for automation.');
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    try {
      const entry = { file: path.resolve(positional[0]) };
      for (const [key, question] of Object.entries({ title: 'Title', category: 'Category (paintings/pastels/photos/homepage)', medium: 'Medium (blank for homepage)', dimensions: 'Physical dimensions (blank for homepage)', description: 'Description (optional)', id: 'Unique ID (optional; generated from category/title)' })) {
        entry[key] = (await rl.question(`${question}: `)).trim();
      }
      console.log(await addEntries(ROOT, [entry], { dryRun }));
    } finally { rl.close(); }
  } else console.log('Commands: add <image>, batch <csv>, build. All accept --dry-run. See IMAGE-WORKFLOW.md.');
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error.message); process.exitCode = 1; });
