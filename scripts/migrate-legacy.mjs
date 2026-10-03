// One-time migration. Keeps existing sources in place; never overwrites a catalog.
import sharp from 'sharp';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { ROOT, slug, build } from './artwork.mjs';
const catalogPath = path.join(ROOT, 'data/catalog.json');
try { await fs.access(catalogPath); throw new Error('Catalog already exists; migration would overwrite metadata.'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const catalog = [], report = [];
for (const category of ['paintings', 'pastels', 'photos']) {
  const code = (await fs.readFile(path.join(ROOT, category + '.js'), 'utf8')).split('\n').filter(line => !line.trim().startsWith('//')).join('\n');
  const pattern = /new Photo\((\d+),\s*("(?:[^"\\]|\\.)*"),\s*("(?:[^"\\]|\\.)*"),\s*("(?:[^"\\]|\\.)*"),\s*("(?:[^"\\]|\\.)*")\)/g;
  for (const match of code.matchAll(pattern)) {
    const [legacySource, title, dimensions, medium] = match.slice(2).map(JSON.parse);
    let source = legacySource, decision = 'Retained displayed source.';
    const candidate = `${category}-fullsize/${path.basename(legacySource)}`;
    try {
      const a = await sharp(path.join(ROOT, legacySource)).metadata();
      const b = await sharp(path.join(ROOT, candidate)).metadata();
      const normalize = p => sharp(path.join(ROOT, p)).autoOrient().resize(48,48,{fit:'fill'}).flatten({background:'#ffffff'}).removeAlpha().raw().toBuffer();
      const [pa, pb] = await Promise.all([normalize(legacySource), normalize(candidate)]);
      const difference = pa.reduce((sum, value, i) => sum + Math.abs(value - pb[i]), 0) / pa.length;
      const ratioDifference = Math.abs((a.width/a.height)/(b.width/b.height)-1);
      if (difference < 10 && ratioDifference < .02 && b.width*b.height > a.width*a.height && a.hasAlpha === b.hasAlpha) {
        source = candidate;
        decision = `Matched larger source (normalized pixel difference ${difference.toFixed(2)}/255).`;
      } else if (difference >= 10 || ratioDifference >= .02) decision = 'Different image/crop/color: retained displayed source; visually reviewed exceptions.';
    } catch (error) { if (!/Input file is missing/.test(error.message) && error.code !== 'ENOENT') throw error; }
    const item = { id: `${category}-${String(match[1]).padStart(2,'0')}-${slug(title)}`, category, title, dimensions, medium, description: '', order: Number(match[1]), source };
    catalog.push(item);
    report.push({ id:item.id, legacySource, source, decision });
  }
}
for (let i=0;i<10;i++) catalog.push({id:`homepage-${i}`, category:'homepage', title:`Homepage background ${i+1}`, order:i, source:`pics/header/${i}.jpg`});
await fs.mkdir(path.join(ROOT,'data'),{recursive:true});
await fs.writeFile(path.join(ROOT,'data/migration-report.json'),JSON.stringify(report,null,2)+'\n');
console.log(await build(ROOT,{catalog}));
