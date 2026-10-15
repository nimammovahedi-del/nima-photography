// /map/world.json — every country's outline for the globe (low detail).
import { countries, findCountry, movingCountries, roundGeometry } from '../../lib/world';

export function GET() {
  // Every country rounded alike, so the borders neighbours share still meet (no slivers between).
  // "m" is a lighter outline drawn while the globe moves, sent only where it differs from "g" (the
  // countries you've been to and their neighbours).
  const data = countries.map((c) => {
    const n = c.properties.name;
    const g = roundGeometry(c.geometry, 2);
    const moving = findCountry(n, movingCountries);
    const m = moving ? roundGeometry(moving.geometry, 2) : g;
    return JSON.stringify(m) === JSON.stringify(g) ? { n, g } : { n, g, m };
  });
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
}
