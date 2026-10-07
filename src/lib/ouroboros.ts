import points from './ouroboros-points.json';
const characters = '.:/+x%#';
export type ArtPointer = { x: number; y: number; strength: number };

// Reference-derived glyphs retain the jaw, tongue and braided coil at every frame.
export function ouroborosFrame(time: number, pointer: ArtPointer = { x: 0, y: 0, strength: 0 }) {
  const entrance = Math.min(1, time / 1.2);
  const blend = entrance * entrance * (3 - 2 * entrance);
  return points.map(([x, y, alpha, glyph], index) => {
    const angle = Math.atan2(y, x);
    const radius = Math.hypot(x, y);
    const wave = (Math.sin(angle * 3 - time * 1.1) * 5 + Math.sin(angle * 5 + time * .65) * 2) * blend;
    const breathe = 1 + Math.sin(time * .8) * .012 * blend;
    let px = x * breathe + Math.cos(angle) * wave;
    let py = y * breathe + Math.sin(angle) * wave;
    // A smooth local pressure field bends nearby glyphs away from the pointer.
    const dx = px - pointer.x, dy = py - pointer.y;
    const distance = Math.hypot(dx, dy);
    const pressure = Math.exp(-(distance * distance) / (95 * 95)) * pointer.strength;
    px += (dx / Math.max(distance, 12)) * pressure * 27;
    py += (dy / Math.max(distance, 12)) * pressure * 27;
    // Soft perspective tilt plus travelling light adds depth without rotating the bite away.
    px += Math.sin(time * .35) * y * .025 * blend;
    py += Math.cos(time * .29) * x * .015 * blend;
    const light = 1 + (-.12 + .12 * Math.sin(angle * 2 - time * 1.4 + radius * .015)) * blend;
    const flowing = blend > .99 && Math.sin(time * 2 - angle * 4 + index * .13) > .96;
    return { x: px, y: py, alpha: Math.min(1, alpha * light + pressure * .16), glyph: characters[flowing ? Math.max(0, glyph - 1) : glyph] };
  });
}
