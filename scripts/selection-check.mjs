import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome',headless:true});
try{for(const width of [1440,390]){
const p=await b.newPage({viewport:{width,height:900},reducedMotion:'reduce'});await p.setExtraHTTPHeaders({'Cache-Control':'no-cache'});await p.goto('http://localhost:3000',{waitUntil:'networkidle'});
assert.deepEqual(await p.locator('.spread-heading h3').allTextContents(),['NIREN Creative','monis. Workspace Builder','VoltX']);
assert.equal(await p.locator('.index-row:visible').count(),10);
await p.locator('.archive-more summary').click();assert.equal(await p.locator('.index-row:visible').count(),16);
await p.locator('.index-row').last().focus();
await p.locator('.archive-more summary').click();assert.equal(await p.locator('.index-row:visible').count(),10);
await p.locator('#heritage').scrollIntoViewIfNeeded();await p.locator('.tiger-turn img').evaluate(i=>i.decode());
await p.waitForTimeout(150);
const before=await p.locator('.heritage-ascii').evaluate(c=>c.toDataURL());
await p.locator('.tiger-turn').press('Enter');await p.waitForTimeout(150);
assert.equal(await p.locator('.tiger-turn').getAttribute('data-pose'),'1');
assert.ok(await p.locator('.heritage-ascii').evaluate((c,before)=>c.toDataURL()===before,before),'Click must not alter background');
assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
await p.locator('#heritage').screenshot({path:`.qa/tiger-large-${width}.png`});await p.close();}
console.log('PASS featured order, 10-row disclosure, independent click pose, desktop/mobile overflow.');
}finally{await b.close();}

