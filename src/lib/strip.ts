// The map strip at the top of a country or city page, worked out once so both the strip itself
// (CountryMap) and the home page's globe (which shrinks into the strip on the way there) agree on
// exactly what it shows.
import type { SortedPlace } from '../site.config';
import { countryView, detailedCountries, findCountry } from './world';

// A wide strip rather than a big rectangle, so the photos below are in view straight away.
// The drawing is wider and taller than any screen shows: the frame crops it to its own shape
// (preserveAspectRatio "slice"), and the country is fitted into a central box that stays in view
// from a 4:3 phone up to a wide desktop strip.
export const STRIP_W = 1600;
export const STRIP_H = 640;
const BOX_W = 860;
const BOX_H = 390;

export function stripProjection(place: SortedPlace) {
  const detail = findCountry(place.map, detailedCountries()) ?? findCountry(place.map)!;
  const pins = place.cities.map((c) => [c.lon, c.lat] as [number, number]);
  const { projection, center } = countryView(detail.geometry, pins, BOX_W, BOX_H, pins.length ? 30 : 20);
  const [tx, ty] = projection.translate();
  projection.translate([tx + (STRIP_W - BOX_W) / 2, ty + (STRIP_H - BOX_H) / 2]);
  projection.clipExtent([
    [0, 0],
    [STRIP_W, STRIP_H],
  ]);
  return { detail, projection, center };
}

/** Where the strip's camera is: the point it's turned to, where that sits, and the zoom. */
export function stripView(place: SortedPlace) {
  const { projection, center } = stripProjection(place);
  const [x, y] = projection.translate();
  const r = (n: number) => Math.round(n * 1000) / 1000;
  return { center: center.map(r) as [number, number], x: r(x), y: r(y), scale: r(projection.scale()) };
}
