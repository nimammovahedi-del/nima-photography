// Country shapes for the globe and the country maps. Runs at build time only.
import { geoArea } from 'd3-geo';
import { feature } from 'topojson-client';
import polygonClipping, { type MultiPolygon, type Polygon } from 'polygon-clipping';
import world110 from 'world-atlas/countries-110m.json';
import world50 from 'world-atlas/countries-50m.json';
import type { Feature, FeatureCollection, Geometry, MultiPolygon as GeoMulti, Position } from 'geojson';
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

/** Low detail — the whole world, for the globe. */
export const countries = load(world110);

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
  // Rounding can collapse tiny islands and lakes into nothing — drop those.
  const polygon = (p: Position[][]) => {
    const rings = p.map(ring);
    return rings[0]?.length >= 4 ? rings.filter((r) => r.length >= 4) : null;
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
