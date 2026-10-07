import points from './ouroboros-points.json';
const TAU = Math.PI * 2;
const headAngle = -1.43;
const radius = 270;
const characters = '.:/+x%#';
const headX = Math.cos(headAngle) * radius;
const headY = Math.sin(headAngle) * radius;
// Place the unwrapping seam at the bite, not across the neck. The entire
// drawing uses the same deformation; there is no independently moving head.
const samples = points.map(([x, y, alpha, glyph]) => {
  let angle = Math.atan2(y, x);
  // Jaw/tongue pixels belong to the front, not to the trailing end of the path.
  if (angle > headAngle && y < -120 && x < 100) angle -= TAU;
  let distance = ((headAngle - angle + TAU) % TAU) * radius;
  if (y < -120 && x < 100 && distance > TAU * radius - 230) distance -= TAU * radius;
  // The reference depicts an already-completed bite. Its short tail segment
  // across the mouth must travel at the back, rather than ride with the head.
  const mouthTail = x > 20 && x < 100 && y > -240 && y < -165;
  if (mouthTail && distance < 230) distance += TAU * radius;
  // Keep the dangling inner tongue out of the approach silhouette. Restore
  // that reference detail only as the bite closes, without changing the hero.
  const tongue = x > 10 && x < 90 && y > -150 && y < -35;
  return { x, y, alpha, glyph: characters[glyph], distance, tongue, offset: Math.hypot(x, y) - radius };
});
export function introFrame(progress: number) {
  const p = Math.min(1, Math.max(0, progress));
  const travel = -460 + p * (TAU * radius + 460);
  const close = Math.max(0, Math.min(1, (p - .96) / .04));
  const bite = close * close * (3 - 2 * close);
  return samples.map(point => {
    if (p >= 1) return point;
    const alpha = point.alpha * (point.tongue ? bite : 1);
    const distance = travel - point.distance;
    if (distance < 0) {
      return { ...point, alpha,
        x: headX + Math.cos(headAngle + Math.PI / 2) * distance + Math.cos(headAngle) * point.offset,
        y: headY + Math.sin(headAngle + Math.PI / 2) * distance - distance * distance / 420 + Math.sin(headAngle) * point.offset };
    }
    const angle = headAngle + distance / radius;
    return { ...point, alpha, x: Math.cos(angle) * (radius + point.offset), y: Math.sin(angle) * (radius + point.offset) };
  });
}
