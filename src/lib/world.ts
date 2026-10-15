// Country shapes for the globe and the country maps. Runs at build time only.
import { geoArea } from 'd3-geo';
import { feature } from 'topojson-client';
import {
  filter,
  filterWeight,
  presimplify,
  quantile,
  simplify,
  sphericalRingArea,
  sphericalTriangleArea,
} from 'topojson-simplify';
import polygonClipping, { type MultiPolygon, type Polygon } from 'polygon-clipping';
import world50 from 'world-atlas/countries-50m.json';
import type { Feature, FeatureCollection, Geometry, MultiPolygon as GeoMulti, Position } from 'geojson';
import { places } from '../site.config';
export { mainland, countryView, layoutLabels } from './geo-shared';

export type Country = Feature<Geometry, { name: string }>;

// The map data has the UK as one country. Split Great Britain along approximate
// England–Scotland and England–Wales borders (lon, lat) so each can be its own region.
const SCOTLAND_CUT: Polygon = [[
  [-9, 54.6], [-5.5, 54.6], [-3.6, 54.9], [-3.05, 54.98], [-2.9, 55.08], [-2.6, 55.17],
  [-2.35, 55.35], [-2.2, 55.45], [-2.3, 55.6], [-2.05, 55.8], [-1.5, 55.9], [0, 55.9],
  [0, 61.5], [-9, 61.5], [-9, 54.6],
]];
const WALES_CUT: Polygon = [[
  [-6, 53.6], [-3.4, 53.6], [-3.08, 53.3], [-3.0, 53.0], [-2.75, 52.95], [-3.15, 52.6],
  [-3.0, 52.35], [-3.1, 52.1], [-2.95, 51.95], [-2.65, 51.8], [-2.65, 51.6], [-2.9, 51.3],
  [-6, 51.3], [-6, 53.6],
]];

/** polygon-clipping winds rings the opposite way to d3-geo; flip them back. */
function toGeo(mp: MultiPolygon): GeoMulti {
  const flipped: GeoMulti = {
    type: 'MultiPolygon',
    coordinates: mp.map((poly) => poly.map((ring) => [...ring].reverse())),
  };
  // A wrongly wound polygon covers almost the whole globe — keep whichever winding is small.
  return geoArea(flipped) > 2 * Math.PI ? { type: 'MultiPolygon', coordinates: mp } : flipped;
}

function splitUK(uk: Country): Country[] {
  const g = uk.geometry as GeoMulti;
  const polys = g.coordinates as unknown as Polygon[];
  const centre = (p: Polygon) => {
    const r = p[0];
    return [r.reduce((s, c) => s + c[0], 0) / r.length, r.reduce((s, c) => s + c[1], 0) / r.length];
  };
  // Northern Ireland sits on the island of Ireland, west of 5.3°W between 54° and 55.4°N.
  const isNI = (p: Polygon) => {
    const [lon, lat] = centre(p);
    return lon < -5.3 && lat > 54 && lat < 55.4;
  };
  const britain = polys.filter((p) => !isNI(p));
  const ni = polys.filter(isNI);

  const make = (name: string, mp: MultiPolygon): Country => ({
    type: 'Feature',
    properties: { name },
    geometry: toGeo(mp),
  });
  return [
    make('England', polygonClipping.difference(britain, SCOTLAND_CUT, WALES_CUT)),
    make('Scotland', polygonClipping.intersection(britain, SCOTLAND_CUT)),
    make('Wales', polygonClipping.intersection(britain, WALES_CUT)),
    make('Northern Ireland', ni),
  ];
}

function load(topology: any): Country[] {
  const fc = feature(topology, topology.objects.countries) as unknown as FeatureCollection<
    Geometry,
    { name: string }
  >;
  return fc.features
    .filter((f) => f.properties.name !== 'Antarctica' && f.geometry)
    .flatMap((f) => (f.properties.name === 'United Kingdom' ? splitUK(f) : [f]));
}

// The globe's outlines come from Natural Earth's 1:50m countries. The countries you've been to keep
// every point (exactly the outline their own page's map strip shows), and so does every border
// they share with a neighbour; the rest of the world is thinned to about the size of the 1:110m
// set, enough to read at a glance. Thinning works on shared borders (topology) rather than country
// by country, so neighbours always meet exactly: no slivers between them at any zoom.
const OTHER_DETAIL = 0.1; // keep about the most significant 10% of other borders' points
const SMALLEST_ISLAND = 3e-5; // of the globe's surface in steradians: about 1,200 km²
const SMALLEST_VISITED_ISLAND = 5e-8; // about 2 km², so visited countries keep their islands
// The map data has the UK as one country; it's split up afterwards (see splitUK).
const UK_PARTS = new Set(['England', 'Scotland', 'Wales', 'Northern Ireland']);
const presimplified = presimplify(structuredClone(world50) as any, sphericalTriangleArea);
function globeTopology(keepVisited: boolean) {
  const t = presimplified;
  const visited = new Set(places.map((p) => (UK_PARTS.has(p.map) ? 'United Kingdom' : p.map)));
  const kept = new Set<number>();
  const mark = (a: any): void => (Array.isArray(a) ? a.forEach(mark) : void kept.add(a < 0 ? ~a : a));
  if (keepVisited) {
    for (const g of t.objects.countries.geometries) if (visited.has(g.properties.name)) mark(g.arcs);
  }
  const minWeight = quantile(t, OTHER_DETAIL);
  const thin = {
    ...t,
    arcs: t.arcs.map((arc: number[][], i: number) =>
      arc.filter((p) => kept.has(i) || p[2] >= minWeight).map((p) => [p[0], p[1]]),
    ),
  };
  // Specks of islands too small to see from the globe only cost drawing time, except on the
  // countries you've been to, which keep nearly all their islands (Scotland's isles, Spain's).
  const big = filterWeight(thin, SMALLEST_ISLAND, sphericalRingArea);
  const visible = filterWeight(thin, SMALLEST_VISITED_ISLAND, sphericalRingArea);
  const ours = (ring: number[]) => ring.every((a) => kept.has(a < 0 ? ~a : a));
  return filter(thin, (ring: number[], interior: boolean) =>
    keepVisited && ours(ring) ? visible(ring, interior) : big(ring, interior),
  );
}

/** Low detail — the whole world, for the globe. */
export const countries = load(globeTopology(true));
/**
 * The same, but with the countries you've been to thinned like the rest: drawn while the globe is
 * moving, when the extra detail can't be seen but costs frames on a phone. Every border is thinned
 * alike, so neighbours still meet exactly.
 */
export const movingCountries = load(globeTopology(false));

/**
 * The home page's region pictures: every country thinned alike to about a fifth of 1:50m's points,
 * as they were drawn before the globe's visited countries got full detail.
 */
export const panelCountries = load(
  (() => {
    const t = presimplify(structuredClone(world50) as any);
    const thin = simplify(t, quantile(t, 0.12));
    return filter(thin, filterWeight(thin, SMALLEST_ISLAND, sphericalRingArea));
  })(),
);

let detailed: Country[] | undefined;
/** High detail — for zoomed-in country views. */
export const detailedCountries = () => (detailed ??= load(world50));

export const findCountry = (name: string, list = countries) =>
  list.find((c) => c.properties.name === name);

/** Round coordinates so the JSON sent to the browser stays small. */
export function roundGeometry(g: Geometry, digits: number): Geometry {
  const f = 10 ** digits;
  const pt = (p: Position) => [Math.round(p[0] * f) / f, Math.round(p[1] * f) / f];
  const ring = (r: Position[]) => {
    const out = r.map(pt).filter((p, i, a) => i === 0 || p[0] !== a[i - 1][0] || p[1] !== a[i - 1][1]);
    const [f0, l0] = [out[0], out[out.length - 1]];
    if (f0 && (f0[0] !== l0[0] || f0[1] !== l0[1])) out.push(f0); // keep the ring closed
    return out;
  };
  // Rounding can collapse tiny islands and lakes into nothing — drop those. A sliver flattened
  // to no area loses its winding too, and d3 would fill the whole globe with it.
  const polygon = (p: Position[][]) => {
    const rings = p.map(ring);
    if (!(rings[0]?.length >= 4)) return null;
    const area = geoArea({ type: 'Polygon', coordinates: [rings[0]] });
    if (area < 1e-9 || area > 2 * Math.PI) return null;
    return rings.filter((r) => r.length >= 4);
  };
  if (g.type === 'Polygon') {
    return { type: 'Polygon', coordinates: polygon(g.coordinates) ?? [] };
  }
  if (g.type === 'MultiPolygon') {
    const polys = g.coordinates.map(polygon).filter((p): p is Position[][] => !!p);
    return { type: 'MultiPolygon', coordinates: polys };
  }
  return g;
}
