import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome',headless:true});
try{
 const p=await b.newPage({viewport:{width:1440,height:900}});
 await p.addInitScript(()=>sessionStorage.setItem('afterimage-intro-seen-v1','1'));
 const errors=[]; p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://localhost:3000',{waitUntil:'networkidle',timeout:60000});
 await p.locator('.index-row').nth(1).focus();
 await p.locator('.archive-ascii[data-ready="true"]').waitFor();
 await p.locator('.index-layout').screenshot({path:'.qa/archive-rhythm.png'});
 await p.locator('.index-row').nth(2).focus();
 await p.locator('.archive-ascii[data-ready="true"]').waitFor();
 const pixels=()=>p.locator('.archive-ascii').evaluate(c=>c.toDataURL());
 const before=await pixels();await p.waitForTimeout(1200);assert.notEqual(await pixels(),before,'ASCII reveal must resolve');
 assert.equal(await p.locator('text=Java → digital').count(),0);
 await p.locator('.archive-more summary').click(); await p.locator('a.index-row[href="/work/monis-workspace-builder"]').click();
 await p.locator('.case-title').waitFor();
 assert.match(await p.locator('.case-title').innerText(),/monis/);
 assert.match(await p.locator('main').innerText(),/Experimental/);
 assert.match(await p.locator('main').innerText(),/Starting points/);
 assert.deepEqual(errors,[]);
 console.log('PASS ASCII image transition, new Sanity route and case study, removed geographic label, runtime errors.');
}finally{await b.close();}

