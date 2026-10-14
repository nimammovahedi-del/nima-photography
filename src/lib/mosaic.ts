// Lays out the cover tiles on a category landing page (e.g. /architecture) as a mosaic:
// landscape covers span two columns, portrait covers stand one column wide and one or two rows
// tall, and the whole thing fills a clean rectangle with no holes. Runs at build time.

export type Shape = 'landscape' | 'portrait';
export interface Tile {
  col: number; // 1-based grid column
  row: number; // 1-based grid row
  w: number; // columns spanned
  h: number; // rows spanned
}

// The sizes each shape may take, cheapest (most natural) first. Costs steer the search towards
// wide landscapes and tall portraits, falling back to squares or a big 2×2 to close gaps.
const OPTIONS: Record<Shape, { w: number; h: number; cost: number }[]> = {
  landscape: [
    { w: 2, h: 1, cost: 0 },
    { w: 3, h: 1, cost: 2 },
    { w: 2, h: 2, cost: 3 },
    { w: 1, h: 1, cost: 5 },
  ],
  portrait: [
    { w: 1, h: 2, cost: 0 },
    { w: 1, h: 1, cost: 1 },
    { w: 2, h: 2, cost: 3 },
  ],
};

/** Places each item at the first free spot, reading left to right, top to bottom. */
function place(sizes: { w: number; h: number }[], cols: number) {
  const grid: boolean[][] = [];
  const free = (r: number, c: number, w: number, h: number) => {
    if (c + w > cols) return false;
    for (let y = r; y < r + h; y++)
      for (let x = c; x < c + w; x++) if (grid[y]?.[x]) return false;
    return true;
  };
  const tiles: Tile[] = sizes.map(({ w, h }) => {
    for (let r = 0; ; r++)
      for (let c = 0; c < cols; c++)
        if (free(r, c, w, h)) {
          for (let y = r; y < r + h; y++) {
            grid[y] ??= [];
            for (let x = c; x < c + w; x++) grid[y][x] = true;
          }
          return { col: c + 1, row: r + 1, w, h };
        }
  });
  const holes = grid.reduce((n, row) => n + cols - row.filter(Boolean).length, 0);
  return { tiles, holes, rows: grid.length };
}

/** Best gap-free mosaic for these shapes in `cols` columns (closest to the natural sizes). */
export function mosaic(shapes: Shape[], cols: number): Tile[] {
  const opts = shapes.map((s) => OPTIONS[s].filter((o) => o.w <= cols));
  let best: { score: number; tiles: Tile[] } | undefined;

  // Try every combination of sizes (a category has a handful of subcategories, so this is cheap).
  const pick: number[] = new Array(shapes.length).fill(0);
  const total = opts.reduce((n, o) => n * o.length, 1);
  for (let k = 0; k < Math.min(total, 200_000); k++) {
    let rest = k;
    for (let i = 0; i < opts.length; i++) {
      pick[i] = rest % opts[i].length;
      rest = Math.floor(rest / opts[i].length);
    }
    const chosen = pick.map((p, i) => opts[i][p]);
    const { tiles, holes } = place(chosen, cols);
    // Holes matter most; then natural sizes; then keeping the list's reading order.
    let outOfOrder = 0;
    for (let i = 1; i < tiles.length; i++) {
      const a = tiles[i - 1];
      const b = tiles[i];
      if (b.row < a.row || (b.row === a.row && b.col < a.col)) outOfOrder++;
    }
    const score = holes * 100 + chosen.reduce((n, o) => n + o.cost, 0) + outOfOrder * 2;
    if (!best || score < best.score) best = { score, tiles };
  }
  return best!.tiles;
}
