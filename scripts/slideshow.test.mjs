import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

test('slideshow waits for readiness and a pause invalidates an in-flight transition',async()=>{
 const timers=new Map(), requests=[], listeners={};let timerId=0;
 const element=()=>({cloneNode(){return element();},style:{},attributes:{},textContent:'',setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,fn){this[k]=fn;},remove(){}});
 const hero={children:[],clientWidth:1200,clientHeight:800,prepend(e){this.children.unshift(e);},append(e){this.children.push(e);},querySelector(){return this.children.find(e=>e.className?.includes('hero-image'));},getBoundingClientRect(){return {bottom:800};}};
 const items=[0,1,2].map(order=>({category:'homepage',order,variants:[{src:String(order)}]}));
 const context=vm.createContext({document:{hidden:false,querySelector:()=>hero,createElement:element,addEventListener(k,fn){listeners[k]=fn;}},
  navigator:{},matchMedia:()=>({matches:false,addEventListener(){}}),IntersectionObserver:class{observe(){}},getComputedStyle:()=>({backgroundImage:'none'}),
  manifest:Promise.resolve(items),chooseVariant:item=>item.variants[0],loadImage:variant=>new Promise((resolve,reject)=>requests.push({variant,resolve,reject})),
  setTimeout(fn,ms){timers.set(++timerId,{fn,ms});return timerId;},clearTimeout(id){timers.delete(id);}});
 const source=(await readFile(new URL('../slideshow.js',import.meta.url),'utf8')).replace(/^import .*\n/,'');
 const running=vm.runInContext(`(async()=>{${source}})()`,context);
 await new Promise(setImmediate);
 requests.shift().resolve(element());await running;
 const first=hero.querySelector();
 const tick=()=>{const entry=[...timers].find(([,t])=>t.ms===5000);timers.delete(entry[0]);return entry[1].fn();};
 const transitioning=tick();
 assert.equal(hero.querySelector(),first);
 const toggle=hero.children.find(e=>e.className==='slideshow-toggle');
 toggle.click();
 requests.shift().resolve(element());await transitioning;
 assert.equal(hero.querySelector(),first);
 assert.equal(toggle.textContent,'Play slideshow');
 toggle.click();await tick();
 assert.notEqual(hero.querySelector(),first);
 assert.equal(toggle.textContent,'Pause slideshow');
 const current=hero.querySelector();
 const failure=tick();requests.shift().reject(new Error('offline'));await failure;
 assert.equal(hero.querySelector(),current);
});

test('existing HTML hero is decoded without refetch; reduced motion and hidden/offscreen states prevent lookahead',async()=>{
 const timers=new Map(),requests=[],listeners={};let timerId=0,observer,preferenceChange;
 const initial={className:'hero-image',decode:async()=>{},style:{}};
 const hero={children:[initial],clientWidth:1200,clientHeight:800,prepend(e){this.children.unshift(e);},append(e){this.children.push(e);},querySelector(){return initial;},getBoundingClientRect(){return {bottom:800};}};
 const preference={matches:true,addEventListener(_,fn){preferenceChange=fn;}};
 const document={hidden:false,querySelector:()=>hero,createElement:()=>({setAttribute(){},addEventListener(){}}),addEventListener(k,fn){listeners[k]=fn;}};
 const items=[0,1].map(order=>({category:'homepage',order,variants:[{src:String(order)}]}));
 const context=vm.createContext({document,navigator:{},matchMedia:()=>preference,
  IntersectionObserver:class{constructor(fn){observer=fn;}observe(){}},manifest:Promise.resolve(items),chooseVariant:item=>item.variants[0],loadImage:variant=>{requests.push(variant.src);return new Promise(()=>{});},
  setTimeout(fn,ms){timers.set(++timerId,{fn,ms});return timerId;},clearTimeout(id){timers.delete(id);}});
 const source=(await readFile(new URL('../slideshow.js',import.meta.url),'utf8')).replace(/^import .*\n/,'');
 await vm.runInContext(`(async()=>{${source}})()`,context);
 assert.deepEqual(requests,[]);
 assert.equal(timers.size,0);
 document.hidden=true;preference.matches=false;preferenceChange();
 assert.equal(requests.length,0);
 document.hidden=false;observer([{isIntersecting:false}]);listeners.visibilitychange();
 assert.equal(requests.length,0);
 observer([{isIntersecting:true}]);
 assert.deepEqual(requests,['1']);
 assert.equal(timers.size,1);
 document.hidden=true;listeners.visibilitychange();
 assert.equal(timers.size,0);
});
