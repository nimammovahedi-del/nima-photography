// Builds the world map's SVG paths at build time (no map library ships to the browser).
import { geoEqualEarth, geoPath, geoArea } from 'd3-geo';
import { feature } from 'topojson-client';
import polygonClipping, { type MultiPolygon, type Polygon } from 'polygon-clipping';
import world from 'world-atlas/countries-110m.json';
import type { Feature, FeatureCollection, Geometry, MultiPolygon as GeoMulti } from 'geojson';

export const WIDTH = 1000;
export const HEIGHT = 500;

type Country = Feature<Geometry, { name: string }>;

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
  const geom: GeoMulti = {
    type: 'MultiPolygon',
    coordinates: mp.map((poly) => poly.map((ring) => [...ring].reverse())),
  };
  // Safety net: a wrongly wound polygon covers almost the whole globe.
  if (geoArea(geom) > 2 * Math.PI) {
    geom.coordinates = mp as GeoMulti['coordinates'];
  }
  return geom;
}

function splitUK(uk: Country): Country[] {
  const polys = (uk.geometry as GeoMulti).coordinates as unknown as Polygon[];
  // Great Britain is the polygon furthest east; the rest is Northern Ireland.
  const centreLon = (p: Polygon) => p[0].reduce((s, c) => s + c[0], 0) / p[0].length;
  const gb = polys.reduce((a, b) => (centreLon(a) > centreLon(b) ? a : b));
  const rest = polys.filter((p) => p !== gb);

  const scotland = polygonClipping.intersection(gb, SCOTLAND_CUT);
  const wales = polygonClipping.intersection(gb, WALES_CUT);
  const england = polygonClipping.difference(gb, SCOTLAND_CUT, WALES_CUT);

  const make = (name: string, mp: MultiPolygon): Country => ({
    type: 'Feature',
    properties: { name },
    geometry: toGeo(mp),
  });
  return [
    make('England', england),
    make('Scotland', scotland),
    make('Wales', wales),
    make('Northern Ireland', rest.map((p) => p) as MultiPolygon),
  ];
}

const all = (
  feature(world as any, (world as any).objects.countries) as unknown as FeatureCollection<
    Geometry,
    { name: string }
  >
).features.filter((f) => f.properties.name !== 'Antarctica');

const countries: Country[] = all.flatMap((f) =>
  f.properties.name === 'United Kingdom' ? splitUK(f) : [f],
);

const projection = geoEqualEarth().fitExtent(
  [
    [4, 4],
    [WIDTH - 4, HEIGHT - 4],
  ],
  { type: 'FeatureCollection', features: countries } as FeatureCollection,
);
const path = geoPath(projection).digits(1);

export const shapes = countries.map((c) => ({ name: c.properties.name, d: path(c) ?? '' }));

/** A viewBox string framing a lon/lat box — used for the World / Europe / Americas buttons. */
export function frame(west: number, south: number, east: number, north: number) {
  const [x0, y0] = projection([west, north])!;
  const [x1, y1] = projection([east, south])!;
  // Keep the map's 2:1 shape so nothing is stretched.
  let w = x1 - x0;
  let h = y1 - y0;
  const cx = x0 + w / 2;
  const cy = y0 + h / 2;
  if (w / h > WIDTH / HEIGHT) h = (w * HEIGHT) / WIDTH;
  else w = (h * WIDTH) / HEIGHT;
  return [cx - w / 2, cy - h / 2, w, h].map((n) => Math.round(n * 10) / 10).join(' ');
}
