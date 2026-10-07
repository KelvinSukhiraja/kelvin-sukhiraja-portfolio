import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.addInitScript(()=>{
  sessionStorage.setItem('afterimage-intro-seen-v1','1');
  window.heroDraws={gpu:0,cpu:0};
  const gpu=WebGLRenderingContext.prototype.drawElements;
  WebGLRenderingContext.prototype.drawElements=function(...args){if(this.canvas.classList.contains('hero-art-stage')) window.heroDraws.gpu++;return gpu.apply(this,args);};
  const cpu=CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage=function(...args){if(this.canvas.classList.contains('hero-art-stage'))window.heroDraws.cpu++;return cpu.apply(this,args);};
 });
 await page.goto('http://localhost:3000',{waitUntil:'domcontentloaded'});
 await page.locator('.hero-art.is-ready').waitFor();
 await page.evaluate(()=>{window.heroDraws={gpu:0,cpu:0};});
 await page.waitForTimeout(1000);
 const counts=await page.evaluate(()=>window.heroDraws);
 assert.ok(counts.gpu>0);assert.equal(counts.cpu,0);
 await page.screenshot({path:'.qa/gpu-hero.png'});
 console.log('One-second hero draw counts:',counts);
 // Context loss must restore the artwork rather than leave an empty hero.
 await page.locator('.hero-art canvas').evaluate(node=>node.getContext('webgl').getExtension('WEBGL_lose_context').loseContext());
 await page.waitForFunction(()=>!document.querySelector('.hero-art').classList.contains('is-ready'));
 console.log('PASS: GPU rendering and context-loss fallback.');
}finally{await browser.close();}
