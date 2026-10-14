// /map/world.json — every country's outline for the globe (low detail).
import { countries, roundGeometry } from '../../lib/world';

export function GET() {
  // Every country rounded alike, so the borders neighbours share still meet (no slivers between).
  const data = countries.map((c) => ({ n: c.properties.name, g: roundGeometry(c.geometry, 2) }));
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
}
