import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 for(const width of [1440,390]) {
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:3000',{waitUntil:'networkidle',timeout:60000});
  await page.locator('#heritage').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector('.heritage-ascii')?.width>0);
  const pixels=()=>page.locator('.heritage-ascii').evaluate(c=>c.toDataURL());
  const before=await pixels();
  await page.locator('.tiger-turn').click();
  await page.waitForTimeout(150);
  assert.ok((await pixels())===before,'ASCII stays fixed when the tiger pose changes');
  await page.locator('.tiger-turn').press('Enter');
  assert.equal(await page.locator('.tiger-turn').getAttribute('data-pose'),'2');
  await page.locator('#heritage').screenshot({path:`.qa/heritage-${width}.png`});
  await page.locator('.work-spread').first().screenshot({path:`.qa/work-compact-${width}.png`});
  await page.locator('.index-row').first().focus();
  await page.locator('.index-preview').screenshot({path:`.qa/index-compact-${width}.png`});
  if(width===1440) assert.ok(await page.locator('.index-preview').evaluate(el=>el.getBoundingClientRect().height)<750,'Description fits desktop');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.deepEqual(errors,[]);
  if(width===1440){
   await page.emulateMedia({reducedMotion:'no-preference'});
   await page.locator('#heritage').scrollIntoViewIfNeeded();
   const box=await page.locator('.heritage-ascii').boundingBox();
   const initial=await pixels();
   await page.mouse.move(box.x+box.width*.82,box.y+box.height*.5);
   await page.waitForTimeout(150);
   assert.notEqual(await pixels(),initial,'ASCII responds to mouse');
  }
  await page.close();
 }
 console.log('PASS compact work/index, tiger click/keyboard/pointer ASCII, mobile overflow and runtime errors.');
}finally{await browser.close();}


