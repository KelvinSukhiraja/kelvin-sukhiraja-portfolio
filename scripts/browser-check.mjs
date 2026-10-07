import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

await fs.mkdir('.qa', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [];
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.addInitScript(() => sessionStorage.setItem('afterimage-intro-seen-v1', '1'));
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.hero-art.is-ready').waitFor({ timeout: 30000 });
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.hero-art-fallback')).opacity === '0');
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.hero-copy')).opacity === '1');
  await page.screenshot({ path: '.qa/desktop-hero.png' });
  const pixels = () => page.locator('.hero-art canvas').evaluate(canvas => canvas.toDataURL());
  const before = await pixels();
  await page.waitForTimeout(800);
  assert.notEqual(await pixels(), before, 'Ouroboros must animate without pointer movement');
  await page.getByRole('button', { name: 'Pause motion' }).click();
  const frozen = await pixels();
  await page.waitForTimeout(400);
  assert.ok((await pixels()) === frozen, 'Pause must freeze the artwork');
  await page.getByRole('button', { name: 'Resume motion' }).click();
  await page.waitForTimeout(400);
  assert.notEqual(await pixels(), frozen, 'Resume must restart the artwork');
  const projectCount = await page.locator('.index-row').count();
  assert.ok(projectCount > 0);
  assert.equal(await page.locator('h1').innerText(), 'Interfaces,\nin motion.');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  assert.equal(overflow, false, 'Desktop must not overflow horizontally');
  const firstRow = page.locator('.index-row').first();
  const firstHref = await firstRow.getAttribute('href');
  const firstTitle = await firstRow.locator('.row-title').innerText();
  await firstRow.click();
  await page.waitForURL(`**${firstHref}`);
  await page.locator('.case-title').waitFor();
  assert.equal(await page.locator('.case-title').innerText(), `${firstTitle}.`);
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.case-title')).opacity === '1');
  await page.screenshot({ path: '.qa/case-study.png', fullPage: true });
  await page.getByRole('link', { name: 'Back to selected work' }).click();
  await page.waitForURL('**/#work');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator('.hero-art.is-ready').waitFor();
  await page.getByRole('button',{name:'Turn the tiger artwork'}).click();
  assert.equal(await page.locator('.tiger-turn').getAttribute('data-pose'), '1');
  await context.close();

  const reduced = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const calmPage = await reduced.newPage();
  await calmPage.addInitScript(() => sessionStorage.setItem('afterimage-intro-seen-v1', '1'));
  calmPage.on('pageerror', error => errors.push(error.message));
  await calmPage.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await calmPage.locator('.index-row').first().waitFor();
  await calmPage.evaluate(() => document.fonts.ready);
  assert.equal(await calmPage.locator('.hero-art canvas').isVisible(), false, 'Reduced motion uses the static ASCII fallback');
  await calmPage.screenshot({ path: '.qa/desktop-full.png', fullPage: true });
  await reduced.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const mobilePage = await mobile.newPage();
  await mobilePage.addInitScript(() => sessionStorage.setItem('afterimage-intro-seen-v1', '1'));
  mobilePage.on('pageerror', error => errors.push(error.message));
  await mobilePage.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await mobilePage.locator('.index-row').first().waitFor();
  await mobilePage.evaluate(() => document.fonts.ready);
  assert.equal(await mobilePage.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Mobile must not overflow horizontally');
  await mobilePage.screenshot({ path: '.qa/mobile-hero.png' });
  await mobilePage.screenshot({ path: '.qa/mobile-full.png', fullPage: true });
  await mobilePage.getByRole('button',{name:'Turn the tiger artwork'}).click();
  assert.equal(await mobilePage.locator('.tiger-turn').getAttribute('data-pose'), '1');
  await mobilePage.locator('.index-row').nth(3).click();
  await mobilePage.locator('.case-title').waitFor();
  assert.equal(await mobilePage.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Mobile case study must not overflow');
  await mobile.close();

  const animatedMobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const animatedPage = await animatedMobile.newPage();
  await animatedPage.addInitScript(() => sessionStorage.setItem('afterimage-intro-seen-v1', '1'));
  animatedPage.on('pageerror', error => errors.push(error.message));
  await animatedPage.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await animatedPage.locator('.hero-art.is-ready').waitFor();
  await animatedPage.waitForFunction(() => getComputedStyle(document.querySelector('.hero-art-fallback')).opacity === '0');
  assert.equal(await animatedPage.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await animatedPage.screenshot({ path: '.qa/mobile-animated.png' });
  await animatedMobile.close();

  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const serverPage = await noJs.newPage();
  await serverPage.addInitScript(() => sessionStorage.setItem('afterimage-intro-seen-v1', '1'));
  await serverPage.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  assert.equal(await serverPage.locator('.index-row').count(), projectCount, 'Projects must be present without JavaScript');
  const missing = await serverPage.goto('http://localhost:3000/work/missing-project-check', { waitUntil: 'domcontentloaded' });
  assert.equal(missing.status(), 404);
  await noJs.close();
  await fs.writeFile('.qa/browser-results.json', JSON.stringify({ checks: 'desktop, mobile, mobile ASCII motion, reduced motion, route round-trip, ASCII control, SSR, 404', projectCount, errors }, null, 2));
  assert.deepEqual(errors, [], 'Browser should have no runtime errors');
  console.log('PASS: desktop/mobile layouts, idle animation, pause/resume, reduced motion, route round-trip, ASCII controls, server-rendered content, and 404.');
} finally { await browser.close(); }





