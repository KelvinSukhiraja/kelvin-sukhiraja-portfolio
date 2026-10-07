import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
// Sample the approved reference into glyph positions, not a replacement invented silhouette.
const width = 180;
const { data, info } = await sharp('public/art/ouroboros-reference.png').flatten({ background: '#fff' }).resize({ width }).greyscale().raw().toBuffer({ resolveWithObject: true });
const points = [];
const characters = '.:/+x%#';
for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < width; x++) {
    const ink = 1 - data[y * width + x] / 255;
    if (ink < .19) continue;
    points.push([+( (x - width / 2) * 3.5).toFixed(2), +((y - info.height / 2) * 3.5).toFixed(2), +(.22 + ink * .65).toFixed(2), Math.min(6, Math.floor(ink * 7))]);
  }
}
await writeFile('src/lib/ouroboros-points.json', JSON.stringify(points));
const text = points.map(([x,y,a,g]) => `<text x="${x}" y="${y}" opacity="${a}">${characters[g]}</text>`).join('');
await writeFile('public/art/ouroboros-still.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-360 -380 720 760"><g fill="#e1e4de" font-family="monospace" font-size="4.5" text-anchor="middle" dominant-baseline="central">${text}</g></svg>`);
console.log(`Generated ${points.length} reference-derived glyphs and matching SVG fallback.`);
// A pre-rendered still avoids parsing thousands of SVG text nodes on first paint.
await sharp('public/art/ouroboros-still.svg', { density: 144 }).webp({ quality: 90, alphaQuality: 100 }).toFile('public/art/ouroboros-still.webp');
