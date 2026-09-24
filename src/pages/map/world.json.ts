// /map/world.json — every country's outline for the globe (low detail).
import { places } from '../../site.config';
import { countries, roundGeometry } from '../../lib/world';

export function GET() {
  const visited = new Set(places.map((p) => p.map));
  const data = countries.map((c) => ({
    n: c.properties.name,
    g: roundGeometry(c.geometry, visited.has(c.properties.name) ? 2 : 1),
  }));
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
}
