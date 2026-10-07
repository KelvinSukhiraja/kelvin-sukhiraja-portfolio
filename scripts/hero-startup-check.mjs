import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({channel:'chrome',headless:true});
try {
 const page = await browser.newPage({viewport:{width:1440,height:1000}});
 let release;
 const gate = new Promise(resolve => { release = resolve; });
 await page.route(/\/_next\/.*\.js(?:\?.*)?$/, async route => { await gate; await route.continue(); });
 await page.goto('http://localhost:3000', {waitUntil:'commit'});
 const still = page.locator('.hero-art-fallback');
 await still.waitFor();
 await page.waitForFunction(() => { const image = document.querySelector('.hero-art-fallback'); return image.complete && image.naturalWidth > 0; });
 assert.equal(await still.evaluate(el => getComputedStyle(el).opacity), '1');
 assert.equal(await page.locator('.hero-art-stage').evaluate(el => getComputedStyle(el).opacity), '0');
 await page.screenshot({path:'.qa/ouroboros-before-hydration.png'});
 release();
 await page.locator('.hero-art.is-ready').waitFor({timeout:30000});
 await page.waitForFunction(() => getComputedStyle(document.querySelector('.hero-art-stage')).opacity === '1');
 const size = await page.locator('.hero-art-stage').evaluate(el => ({width:el.width,height:el.height}));
 assert.ok(size.width > 300 && size.height > 150);
 await page.screenshot({path:'.qa/ouroboros-after-hydration.png'});
 console.log('PASS: artwork visible before JavaScript; correctly sized animated canvas crossfades in after hydration.');
} finally { await browser.close(); }
