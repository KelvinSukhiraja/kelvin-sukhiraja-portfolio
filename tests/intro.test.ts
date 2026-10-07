import test from 'node:test';
import assert from 'node:assert/strict';
import { introFrame } from '../src/lib/ouroboros-intro';
import points from '../src/lib/ouroboros-points.json';

test('intro finishes at the approved hero geometry and stays finite along its path', () => {
 for (const progress of [0,.2,.5,.8,1]) {
  for (const point of introFrame(progress)) assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y));
 }
 const final= introFrame(1);
 points.forEach(([x,y],i)=>{ assert.equal(final[i].x,x); assert.equal(final[i].y,y); });
 assert.ok(introFrame(0).every(point=>point.y < -380), 'Snake begins outside the visible composition');
});

test('the dangling mouth detail appears only when the bite closes', () => {
 const moving = introFrame(.5), closing = introFrame(.98), final = introFrame(1);
 let details = 0;
 points.forEach(([x,y,alpha],i)=>{
  if(x>10 && x<90 && y> -150 && y< -35){
   details++;
   assert.equal(moving[i].alpha,0);
   assert.ok(closing[i].alpha>0 && closing[i].alpha<alpha);
  }
  assert.equal(final[i].alpha,alpha);
 });
 assert.ok(details>0);
});
