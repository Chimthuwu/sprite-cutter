/**
 * Guess how a freshly uploaded sprite sheet is laid out.
 * Returns square tiles. The old guess (largest common size that divides either side) turned a 128x32 strip
 * of four 32px frames into a single 128px tile; strips and grids are now detected properly.
 */
export interface GridGuess {
  cols: number;
  rows: number;
  tileWidth: number;
  tileHeight: number;
}

const COMMON_SIZES = [256, 128, 64, 48, 32, 24, 16];
const MAX_STRIP_FRAMES = 64;

export function guessGrid(width: number, height: number): GridGuess {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));

  // A small square image is one sprite, not a grid of tiny ones.
  if (w === h && w <= 64) return { cols: 1, rows: 1, tileWidth: w, tileHeight: h };

  // Horizontal strip: width is a whole multiple of height (e.g. 128x32 = 4 frames of 32x32).
  if (w > h && w % h === 0 && w / h <= MAX_STRIP_FRAMES) {
    return { cols: w / h, rows: 1, tileWidth: h, tileHeight: h };
  }
  // Vertical strip.
  if (h > w && h % w === 0 && h / w <= MAX_STRIP_FRAMES) {
    return { cols: 1, rows: h / w, tileWidth: w, tileHeight: w };
  }
  // Grid: largest common tile size that divides both sides and yields at least two frames.
  for (const size of COMMON_SIZES) {
    if (w % size === 0 && h % size === 0 && (w / size) * (h / size) >= 2) {
      return { cols: w / size, rows: h / size, tileWidth: size, tileHeight: size };
    }
  }
  // Nothing divides evenly: pick the common size (no bigger than the smaller side) that leaves the least leftover.
  const limit = Math.min(w, h);
  const candidates = COMMON_SIZES.filter((s) => s <= limit);
  if (candidates.length === 0) return { cols: 1, rows: 1, tileWidth: w, tileHeight: h };
  let best = candidates[0];
  let bestLeft = Infinity;
  for (const size of candidates) {
    const left = (w % size) + (h % size);
    if (left < bestLeft) {
      best = size;
      bestLeft = left;
    }
  }
  return {
    cols: Math.max(1, Math.round(w / best)),
    rows: Math.max(1, Math.round(h / best)),
    tileWidth: best,
    tileHeight: best,
  };
}
