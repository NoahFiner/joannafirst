import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { build, addEntries, parseBatch, validateCatalog } from './artwork.mjs';

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'portfolio-images-'));
  t.after(() => fs.rm(root, {recursive:true,force:true}));
  await fs.mkdir(path.join(root,'data'));
  await sharp({create:{width:900,height:450,channels:4,background:{r:150,g:60,b:40,alpha:.5}}}).png().toFile(path.join(root,'master.png'));
  const item={id:'paintings-sample',title:'Sample',category:'paintings',dimensions:'20x10',medium:'acrylic',order:0,source:'master.png'};
  await fs.writeFile(path.join(root,'data/catalog.json'),JSON.stringify([item]));
  return {root,item};
}
test('build preserves composition/alpha, caps sizes, retains masters and reuses identical exports',async t=>{
  const {root}=await fixture(t);
  const original=await fs.readFile(path.join(root,'master.png'));
  assert.deepEqual(await build(root),{generated:1,reused:0,count:1});
  const filename=path.join(root,'data/images.json');
  const before=await fs.readFile(filename,'utf8');
  const {images:[image]}=JSON.parse(before);
  assert.equal(image.thumbnail.width,300);
  assert.equal(image.thumbnail.height,150);
  assert.deepEqual(image.variants.map(v=>v.width),[800,900]);
  const metadata=await sharp(path.join(root,image.variants[0].src)).metadata();
  assert.equal(metadata.hasAlpha,true);
  assert.ok(metadata.icc);
  assert.deepEqual(await fs.readFile(path.join(root,'master.png')),original);
  assert.deepEqual(await build(root),{generated:0,reused:1,count:1});
  assert.equal(await fs.readFile(filename,'utf8'),before);
  await fs.writeFile(path.join(root,image.thumbnail.src),'corrupt');
  assert.equal((await build(root)).generated,1);
  await sharp(path.join(root,image.thumbnail.src)).metadata();
});
test('failed batch/build never publishes partial metadata; dry runs are nonmutating',async t=>{
  const {root,item}=await fixture(t);
  await build(root);
  const before=await fs.readFile(path.join(root,'data/images.json'),'utf8');
  const catalog=await fs.readFile(path.join(root,'data/catalog.json'),'utf8');
  await assert.rejects(build(root,{catalog:[item,{...item,id:'missing',source:'missing.jpg'}]}));
  assert.equal(await fs.readFile(path.join(root,'data/images.json'),'utf8'),before);
  assert.equal(await fs.readFile(path.join(root,'data/catalog.json'),'utf8'),catalog);
  const file=path.join(root,'new.png');
  await sharp({create:{width:80,height:160,channels:3,background:'#334455'}}).png().toFile(file);
  const entry={file,title:'New Work',category:'pastels',medium:'pastel',dimensions:'1x2'};
  await addEntries(root,[entry],{dryRun:true});
  assert.equal(await fs.readFile(path.join(root,'data/images.json'),'utf8'),before);
  await assert.rejects(fs.access(path.join(root,'originals')));
  await addEntries(root,[entry]);
  const generated=JSON.parse(await fs.readFile(path.join(root,'data/images.json'))).images;
  assert.equal(generated.length,2);
  assert.equal(generated[1].variants.length,1);
  assert.equal(generated[1].variants[0].height,160);
  await assert.rejects(addEntries(root,[{...entry,title:'Duplicate'}]),/Duplicate image/);
});
test('orientation is applied before export and metadata edits update without reencoding',async t=>{
  const {root,item}=await fixture(t);
  await sharp({create:{width:120,height:60,channels:3,background:'#998877'}}).withMetadata({orientation:6}).jpeg().toFile(path.join(root,'rotated.jpg'));
  await build(root,{catalog:[{...item,source:'rotated.jpg'}]});
  let output=JSON.parse(await fs.readFile(path.join(root,'data/images.json'))).images[0];
  assert.equal(output.variants[0].width,60);
  assert.equal(output.variants[0].height,120);
  assert.equal((await build(root,{catalog:[{...item,source:'rotated.jpg',title:'Corrected'}]})).reused,1);
  output=JSON.parse(await fs.readFile(path.join(root,'data/images.json'))).images[0];
  assert.equal(output.title,'Corrected');
});
test('CSV quotes, paths and validation',()=>{
  const [row]=parseBatch('file,title,category,medium,dimensions\n"a,b.jpg","Title, with comma",paintings,oil,2x3\n','/tmp');
  assert.equal(row.file,'/tmp/a,b.jpg');
  assert.equal(row.title,'Title, with comma');
  assert.throws(()=>validateCatalog([{id:'../bad'}]),/Invalid ID/);
});

test('build updates only generated hero blocks with responsive eager markup',async t=>{
  const {root,item}=await fixture(t);
  const html='<h1>User content</h1>\n<!-- generated:hero:start -->old<!-- generated:hero:end -->\n<p>Keep me</p>';
  await fs.writeFile(path.join(root,'index.html'),html);
  await fs.writeFile(path.join(root,'resume.html'),html);
  await build(root,{catalog:[item,{...item,id:'homepage-first',category:'homepage',order:0}]});
  const home=await fs.readFile(path.join(root,'index.html'),'utf8');
  const resume=await fs.readFile(path.join(root,'resume.html'),'utf8');
  assert.ok(home.startsWith('<h1>User content</h1>'));
  assert.ok(home.endsWith('<p>Keep me</p>'));
  assert.match(home,/srcset="[^"]+ 800w, [^"]+ 900w"/);
  assert.match(home,/fetchpriority="high"/);
  assert.match(home,/sizes="max\(100vw, 200.00svh\)"/);
  assert.match(resume,/sizes="max\(100vw, 1000.00px\)"/);
  await build(root);
  assert.equal(await fs.readFile(path.join(root,'index.html'),'utf8'),home);
});
