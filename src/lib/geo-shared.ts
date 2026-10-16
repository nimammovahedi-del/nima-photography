// Small geometry helpers used both at build time and in the browser (no map data imported here).
import { geoArea, geoCentroid, geoOrthographic, type GeoProjection } from 'd3-geo';
import type { Feature, Geometry } from 'geojson';

/**
 * The main landmass of a country (e.g. the lower 48 for the US, not Alaska) —
 * used to centre and frame the zoomed-in view.
 */
export function mainland(g: Geometry): Geometry {
  if (g.type !== 'MultiPolygon') return g;
  let best = g.coordinates[0];
  let bestArea = -1;
  for (const coords of g.coordinates) {
    const a = geoArea({ type: 'Polygon', coordinates: coords });
    if (a > bestArea) {
      best = coords;
      bestArea = a;
    }
  }
  return { type: 'Polygon', coordinates: best };
}

/** Where to point the globe, and how far to zoom, so a country and its pins fill the box. */
export function countryView(
  g: Geometry,
  pins: [number, number][],
  width: number,
  height: number,
  pad: number,
): { center: [number, number]; scale: number; projection: GeoProjection } {
  const main = mainland(g);
  const center = geoCentroid(main) as [number, number];
  const target: Feature = {
    type: 'Feature',
    properties: {},
    geometry: pins.length
      ? { type: 'GeometryCollection', geometries: [main, { type: 'MultiPoint', coordinates: pins }] }
      : main,
  };
  const projection = geoOrthographic()
    .rotate([-center[0], -center[1]])
    .fitExtent(
      [
        [pad, pad],
        [width - pad, height - pad],
      ],
      target,
    );
  return { center, scale: projection.scale(), projection };
}

export type Side = 'right' | 'left' | 'up' | 'down';

/**
 * Chooses which side of each pin its label sits on so labels don't overlap.
 * Coordinates and sizes are in pixels.
 */
export function layoutLabels(
  pins: { x: number; y: number; w: number; h: number }[],
  bounds: { width: number; height: number },
): Side[] {
  const GAP = 9;
  const placed: { x0: number; y0: number; x1: number; y1: number }[] = [];
  const boxFor = (p: (typeof pins)[number], side: Side) => {
    switch (side) {
      case 'right':
        return { x0: p.x + GAP, y0: p.y - p.h / 2, x1: p.x + GAP + p.w, y1: p.y + p.h / 2 };
      case 'left':
        return { x0: p.x - GAP - p.w, y0: p.y - p.h / 2, x1: p.x - GAP, y1: p.y + p.h / 2 };
      case 'up':
        return { x0: p.x - p.w / 2, y0: p.y - GAP - p.h, x1: p.x + p.w / 2, y1: p.y - GAP };
      case 'down':
        return { x0: p.x - p.w / 2, y0: p.y + GAP, x1: p.x + p.w / 2, y1: p.y + GAP + p.h };
    }
  };
  const hits = (b: ReturnType<typeof boxFor>) =>
    b.x0 < 0 ||
    b.x1 > bounds.width ||
    b.y0 < 0 ||
    b.y1 > bounds.height ||
    placed.some((o) => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0) ||
    // don't cover another pin's dot
    pins.some((q) => q.x > b.x0 - 4 && q.x < b.x1 + 4 && q.y > b.y0 - 4 && q.y < b.y1 + 4);

  // Place pins left-to-right so neighbours negotiate sensibly.
  const order = pins.map((_, i) => i).sort((a, b) => pins[a].x - pins[b].x);
  const sides: Side[] = new Array(pins.length).fill('right');
  for (const i of order) {
    const p = pins[i];
    const choice =
      (['right', 'left', 'up', 'down'] as Side[]).find((s) => !hits(boxFor(p, s))) ?? 'right';
    sides[i] = choice;
    placed.push(boxFor(p, choice));
  }
  return sides;
}

/** Where a label's leader line runs: from the pin to the nearest point of the label. */
function leader(dx: number, dy: number, w: number, h: number) {
  const x = Math.max(dx, Math.min(0, dx + w));
  const y = Math.max(dy, Math.min(0, dy + h));
  return { x, y, len: Math.hypot(x, y), angle: (Math.atan2(y, x) * 180) / Math.PI };
}

/** A label placed further from its pin than this gets a thin line back to the pin. */
export const LEADER_FROM = 13;

/**
 * Like layoutLabels, but every label is always shown: each one tries the four sides, then the
 * four corners, then the same again further out, and takes the first spot that's clear. If none
 * is, it takes the spot that overlaps least. A label that ends up away from its pin (a crowded
 * cluster) gets a leader line, and spots whose line would cross another label or line are
 * avoided, so every name can be traced to its dot. Returns each label's top-left corner relative
 * to its pin, and its leader line (len 0: none), in pixels. `first` pins are placed before the
 * rest.
 */
export function placeLabels(
  pins: { x: number; y: number; w: number; h: number }[],
  bounds: { width: number; height: number },
  opts: { first?: number[] } = {},
): { dx: number; dy: number; len: number; angle: number }[] {
  const GAP = 9;
  type Box = { x0: number; y0: number; x1: number; y1: number };
  type Seg = { ax: number; ay: number; bx: number; by: number };
  const placed: Box[] = [];
  const lines: Seg[] = [];
  const candidates = (p: (typeof pins)[number]) => {
    const out: { dx: number; dy: number }[] = [];
    for (const step of [0, 1, 2, 3, 4]) {
      const g = GAP + step * (p.h * 0.75);
      out.push(
        { dx: g, dy: -p.h / 2 }, // right
        { dx: -g - p.w, dy: -p.h / 2 }, // left
        { dx: -p.w / 2, dy: -g - p.h }, // above
        { dx: -p.w / 2, dy: g }, // below
        { dx: g * 0.6, dy: -g * 0.6 - p.h }, // above right
        { dx: -g * 0.6 - p.w, dy: -g * 0.6 - p.h }, // above left
        { dx: g * 0.6, dy: g * 0.6 }, // below right
        { dx: -g * 0.6 - p.w, dy: g * 0.6 }, // below left
      );
    }
    return out;
  };
  const overlap = (a: Box, b: Box) =>
    Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) *
    Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
  const cross = (a: Seg, b: Seg) => {
    const d = (px: number, py: number, qx: number, qy: number, rx: number, ry: number) =>
      (qx - px) * (ry - py) - (qy - py) * (rx - px);
    const d1 = d(a.ax, a.ay, a.bx, a.by, b.ax, b.ay);
    const d2 = d(a.ax, a.ay, a.bx, a.by, b.bx, b.by);
    const d3 = d(b.ax, b.ay, b.bx, b.by, a.ax, a.ay);
    const d4 = d(b.ax, b.ay, b.bx, b.by, a.bx, a.by);
    return d1 * d2 < 0 && d3 * d4 < 0;
  };
  // Does a line pass through a box (or right along its edge)? Sampled every few pixels.
  const through = (l: Seg, b: Box) => {
    const n = Math.max(2, Math.ceil(Math.hypot(l.bx - l.ax, l.by - l.ay) / 4));
    for (let k = 1; k < n; k++) {
      const x = l.ax + ((l.bx - l.ax) * k) / n;
      const y = l.ay + ((l.by - l.ay) * k) / n;
      if (x > b.x0 - 3 && x < b.x1 + 3 && y > b.y0 - 3 && y < b.y1 + 3) return true;
    }
    return false;
  };
  const cost = (b: Box, line: Seg | null, self: number) => {
    let c = 0;
    // Outside the frame counts heavily; other labels and other pins' dots count by area.
    const inside = {
      x0: Math.max(b.x0, 0),
      y0: Math.max(b.y0, 0),
      x1: Math.min(b.x1, bounds.width),
      y1: Math.min(b.y1, bounds.height),
    };
    c += ((b.x1 - b.x0) * (b.y1 - b.y0) - Math.max(0, inside.x1 - inside.x0) * Math.max(0, inside.y1 - inside.y0)) * 4;
    for (const o of placed) c += overlap(b, o);
    pins.forEach((q, j) => {
      // A margin round each dot, so a label never sits so close to another city's dot that it
      // reads as that city's name.
      if (j !== self) c += overlap(b, { x0: q.x - 13, y0: q.y - 13, x1: q.x + 13, y1: q.y + 13 }) * 2;
    });
    if (line) {
      for (const o of lines) if (cross(line, o)) c += 600;
      for (const o of placed) if (through(line, o)) c += 600;
      // …and the longer the line, the harder it is to follow.
      c += Math.hypot(line.bx - line.ax, line.by - line.ay);
    }
    // Lines already drawn mustn't run through this label either.
    for (const o of lines) if (through(o, b)) c += 600;
    return c;
  };

  const first = opts.first ?? [];
  const order = [
    ...first,
    ...pins
      .map((_, i) => i)
      .filter((i) => !first.includes(i))
      .sort((a, b) => pins[a].x - pins[b].x),
  ];
  const result = pins.map(() => ({ dx: GAP, dy: 0, len: 0, angle: 0 }));
  for (const i of order) {
    const p = pins[i];
    let best = { dx: GAP, dy: -p.h / 2 };
    let bestLine: Seg | null = null;
    let bestCost = Infinity;
    for (const c of candidates(p)) {
      const box = { x0: p.x + c.dx, y0: p.y + c.dy, x1: p.x + c.dx + p.w, y1: p.y + c.dy + p.h };
      const l = leader(c.dx, c.dy, p.w, p.h);
      const line = l.len > LEADER_FROM ? { ax: p.x, ay: p.y, bx: p.x + l.x, by: p.y + l.y } : null;
      const k = cost(box, line, i);
      if (k < bestCost) {
        best = c;
        bestLine = line;
        bestCost = k;
        if (k === 0) break;
      }
    }
    const l = leader(best.dx, best.dy, p.w, p.h);
    result[i] = { ...best, len: l.len > LEADER_FROM ? l.len : 0, angle: l.angle };
    placed.push({ x0: p.x + best.dx, y0: p.y + best.dy, x1: p.x + best.dx + p.w, y1: p.y + best.dy + p.h });
    if (bestLine) lines.push(bestLine);
  }
  return result;
}
