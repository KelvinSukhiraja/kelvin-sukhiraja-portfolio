import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome',headless:true});
try{
for(const [width,height] of [[1366,768],[1440,900],[1920,1080],[2560,1440],[390,844]]){
const p=await b.newPage({viewport:{width,height},reducedMotion:'reduce'});
await p.goto('http://localhost:3000',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
const stats=await p.evaluate(()=>{const r=s=>document.querySelector(s).getBoundingClientRect();return {heroBottom:r('.hero').bottom,heritage:r('#heritage').height,about:r('.about').height,index:r('.index-preview').height,footer:r('.contact').height,overflow:document.documentElement.scrollWidth>innerWidth,copyGap:r('.hero-copy').top-r('.hero-title').bottom};});
console.log(width,height,stats);
assert.equal(stats.overflow,false);
if(width>760){assert.ok(stats.heroBottom<=height,'Hero and header fit');assert.ok(stats.heritage<=height,'Heritage including caption fits');assert.ok(stats.copyGap>0,'Hero copy does not overlap title');assert.ok(stats.index<height,'Preview description fits');}
await p.screenshot({path:`.qa/fit-hero-${width}.png`});
await p.locator('#heritage').scrollIntoViewIfNeeded();await p.locator('.tiger-turn img').evaluate(i=>i.decode());
await p.locator('#heritage').screenshot({path:`.qa/fit-heritage-${width}.png`});
await p.close();}
console.log('PASS responsive desktop sizing and mobile overflow.');
}finally{await b.close();}
