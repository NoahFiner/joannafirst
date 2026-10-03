import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

// Run the production controller against a small DOM and controlled image promises.
// This deliberately varies completion order instead of relying on localhost speed.
test('gallery keeps old artwork while loading; newest request wins; errors allow retry; bounds wrap',async()=>{
  const nodes=new Map();
  const element=()=>({children:[],style:{},attributes:{},textContent:'',hidden:false,clientWidth:1000,clientHeight:600,
    classList:{toggle(){}},setAttribute(k,v){this.attributes[k]=v;},append(...items){this.children.push(...items);},
    replaceChildren(...items){this.children=items;},addEventListener(){}});
  const document={body:{dataset:{gallery:'paintings'}},querySelector(id){if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);},createElement:element,addEventListener(){}};
  const items=['A','B','C'].map((title,i)=>({title,category:'paintings',order:i,dimensions:'1x1',medium:'oil',thumbnail:{src:'thumb',width:10,height:10},variants:[{src:title}]}));
  const requests=[];
  const context=vm.createContext({document,navigator:{connection:{saveData:true}},setTimeout,clearTimeout,
    manifest:Promise.resolve(items),chooseVariant:item=>item.variants[0],loadImage:variant=>new Promise((resolve,reject)=>requests.push({src:variant.src,resolve,reject}))});
  const source=(await readFile(new URL('../gallery.js',import.meta.url),'utf8')).replace(/^import .*\n/,'');
  await vm.runInContext(`(async()=>{${source}\nreturn {show};})()`,context).then(api=>context.api=api);
  requests.shift().resolve(element());
  await new Promise(setImmediate);
  const title=nodes.get('#car-title'), front=nodes.get('#carousel-front');
  assert.equal(title.textContent,'A');
  const old=front.children[0];
  const slow=context.api.show(1), fast=context.api.show(2);
  assert.equal(title.textContent,'A');
  assert.equal(front.children[0],old);
  const b=requests.shift(),c=requests.shift();
  c.resolve(element());await fast;
  b.resolve(element());await slow;
  assert.equal(title.textContent,'C');
  const failing=context.api.show(1);requests.shift().reject(new Error('offline'));await failing;
  assert.equal(title.textContent,'C');
  assert.equal(nodes.get('#carousel-outer').children[0].children[1].hidden,false);
  const retry=context.api.show(1);requests.shift().resolve(element());await retry;
  assert.equal(title.textContent,'B');
  const wrapped=context.api.show(-1);
  assert.equal(requests[0].src,'C');requests.shift().resolve(element());await wrapped;
  assert.equal(title.textContent,'C');
});
