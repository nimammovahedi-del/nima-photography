// /map/detail.json — detailed outlines of the countries you've visited, for the zoomed-in view.
import { places } from '../../site.config';
import { detailedCountries, findCountry, roundGeometry } from '../../lib/world';

export function GET() {
  const data = Object.fromEntries(
    places.map((p) => {
      const c = findCountry(p.map, detailedCountries());
      return [p.map, c ? roundGeometry(c.geometry, 2) : null];
    }),
  );
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
}
