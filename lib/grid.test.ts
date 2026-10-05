import assert from 'node:assert/strict';
import { guessGrid } from './grid';

const cases: [string, number, number, number, number, number][] = [
  // name, width, height, cols, rows, tile
  ['128x32 strip (the reported bug)', 128, 32, 4, 1, 32],
  ['vertical strip 32x128', 32, 128, 1, 4, 32],
  ['default sheet 1024x384', 1024, 384, 8, 3, 128],
  ['square 256x256 grid', 256, 256, 2, 2, 128],
  ['single sprite 64x64', 64, 64, 1, 1, 64],
  ['uneven 100x70 (best fit, 32px tiles)', 100, 70, 3, 2, 32],
];
for (const [name, w, h, cols, rows, tile] of cases) {
  const g = guessGrid(w, h);
  assert.deepEqual(
    [g.cols, g.rows, g.tileWidth, g.tileHeight],
    [cols, rows, tile, tile],
    `${name}: got ${JSON.stringify(g)}`,
  );
  console.log('ok  ', name, JSON.stringify(g));
}
console.log('all grid guesses ok');
