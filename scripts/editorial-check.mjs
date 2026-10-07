import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 for(const width of [1440,390]) {
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
  await page.goto('http://localhost:3000',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('.wordmark').innerText(),'KELVIN SUKHIRAJA');
  assert.equal(await page.locator('a[href="https://github.com/kelvinsukhiraja"]').count(),1);
  assert.equal(await page.locator('a[href="https://linkedin.com/in/kelvinsukhiraja"]').count(),1);
  await page.locator('.index-row').nth(2).focus();
  const title=await page.locator('.index-row').nth(2).locator('.row-title').innerText();
  await page.waitForFunction(title=>document.querySelector('.archive-caption>span')?.textContent===title,title,{timeout:10000});
  if(width===390){
   await page.getByRole('button',{name:'Preview next project'}).click();
   const nextTitle=await page.locator('.index-row').nth(3).locator('.row-title').innerText();
   await page.waitForFunction(title=>document.querySelector('.archive-caption>span')?.textContent===title,nextTitle);
  }
  await page.locator('.practice-disciplines details').last().locator('summary').click();
  assert.equal(await page.locator('.practice-disciplines details').last().getAttribute('open'),'');
  await page.getByRole('button',{name:'Turn the tiger artwork'}).click();
  assert.equal(await page.locator('.tiger-turn').getAttribute('data-pose'),'1');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.screenshot({path:`.qa/editorial-${width}.png`,fullPage:true});
  await page.close();
 }
 console.log('PASS: corrected name, social URLs, archive focus preview, disciplines, tiger pose control, desktop/mobile overflow.');
}finally{await browser.close();}



