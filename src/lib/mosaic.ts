// Lays out the cover tiles on a category landing page (e.g. /architecture) as a mosaic:
// landscape covers span two columns, portrait covers are one column wide and either a square
// (one row) or tall (two rows), with no gaps in the middle of the grid (open space along the
// bottom is fine; it fills in as subcategories are added). Runs at build time.

export type Shape = 'landscape' | 'portrait';
export interface Tile {
  col: number; // 1-based grid column
  row: number; // 1-based grid row
  w: number; // columns spanned
  h: number; // rows spanned
}

// The sizes each shape may take, cheapest (most natural) first. Costs steer the search towards
// wide landscapes and a mix of tall and square portraits; every extra row also costs a little,
// so the grid stays compact as subcategories are added.
const OPTIONS: Record<Shape, { w: number; h: number; cost: number }[]> = {
  landscape: [
    { w: 2, h: 1, cost: 0 },
    { w: 3, h: 1, cost: 2 },
    { w: 1, h: 1, cost: 8 },
  ],
  portrait: [
    { w: 1, h: 2, cost: 0 },
    { w: 1, h: 1, cost: 0 },
  ],
};
const ROW_COST = 1;
// With two or more portrait covers, aim for roughly one in three tall (at least one), so a page
// mixes tall tiles in with the squares instead of turning all-square.
const MIX_COST = 6;

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
  // Open space along the bottom edge of the grid is fine (it fills in as subcategories are
  // added); an empty cell with a tile somewhere below it is a hole in the middle.
  let holes = 0;
  let open = 0;
  for (let x = 0; x < cols; x++) {
    let bottom = -1;
    grid.forEach((row, y) => row[x] && (bottom = y));
    for (let y = 0; y < grid.length; y++) if (!grid[y][x]) y < bottom ? holes++ : open++;
  }
  return { tiles, holes, trailing: open, rows: grid.length };
}

function search(shapes: Shape[], cols: number) {
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
    const { tiles, holes, trailing, rows } = place(chosen, cols);
    // Holes matter most; then natural sizes, a mix of tall and square, a compact grid and a full
    // last row; then the list's reading order.
    let outOfOrder = 0;
    for (let i = 1; i < tiles.length; i++) {
      const a = tiles[i - 1];
      const b = tiles[i];
      if (b.row < a.row || (b.row === a.row && b.col < a.col)) outOfOrder++;
    }
    const portraits = shapes.filter((s) => s === 'portrait').length;
    const talls = chosen.filter((o, i) => shapes[i] === 'portrait' && o.h === 2).length;
    const mix = portraits >= 2 ? Math.abs(talls - Math.max(1, Math.round(portraits / 3))) : 0;
    const score =
      holes * 100 +
      trailing +
      chosen.reduce((n, o) => n + o.cost, 0) +
      rows * ROW_COST +
      mix * MIX_COST +
      outOfOrder * 2;
    if (!best || score < best.score) best = { score, tiles };
  }
  return best!.tiles;
}

/** Best mosaic for these covers in `cols` columns. */
export function mosaic(shapes: Shape[], cols: number): { cols: number; tiles: Tile[] } {
  return { cols, tiles: search(shapes, cols) };
}
