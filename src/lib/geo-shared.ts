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
