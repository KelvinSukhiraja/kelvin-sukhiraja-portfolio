import test from 'node:test';
import assert from 'node:assert/strict';
import { ouroborosFrame } from '../src/lib/ouroboros';
import points from '../src/lib/ouroboros-points.json';

test('first animation frame exactly matches the static artwork coordinates and opacity', () => {
  const frame = ouroborosFrame(0);
  points.forEach(([x, y, alpha], index) => {
    assert.equal(frame[index].x, x);
    assert.equal(frame[index].y, y);
    assert.equal(frame[index].alpha, alpha);
  });
});

test('pointer pressure is local and does not depend on advancing animation time', () => {
  const still = ouroborosFrame(2);
  const pointer = { x: -230, y: 0, strength: 1 };
  const bent = ouroborosFrame(2, pointer);
  let near = 0, far = 0;
  for (let i = 0; i < still.length; i++) {
    const a = still[i], b = bent[i];
    const distance = Math.hypot(a.x - pointer.x, a.y - pointer.y);
    const displacement = Math.hypot(a.x - b.x, a.y - b.y);
    if (distance < 80) near = Math.max(near, displacement);
    if (distance > 300) far = Math.max(far, displacement);
    assert.ok(Number.isFinite(b.x) && Number.isFinite(b.y));
  }
  assert.ok(near > 10, 'Nearby characters visibly react');
  assert.ok(far < .02, 'Opposite side retains its silhouette');
  assert.deepEqual(ouroborosFrame(2, { ...pointer, strength: 0 }), still, 'Leaving restores the undisturbed shape');
});
