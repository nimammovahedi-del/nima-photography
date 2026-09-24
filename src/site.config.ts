// Site-wide settings. Edit these values; no other code needs to change.
export const site = {
  name: 'Nima Movahedi',
  tagline: 'Photography',
  intro:
    'Architecture, places, landscapes and animals — mostly on a Canon EOS, with a smaller body of work in film simulation.',
  // The welcome line on the home page, above the region panels.
  welcome:
    'I photograph buildings, cities, wild places and the animals in them, wherever I travel. Open a region below to wander the map country by country, or jump into a subject from the tabs above.',
};

// Sub-tabs for each subject. Add or rename freely — they're shown alphabetically.
// A photo joins a sub-tab via `sub:` in photos.yaml.
export const categories = [
  {
    slug: 'architecture',
    label: 'Architecture',
    subs: ['Ancient', 'Art Deco', 'Brutalism', 'Gothic', 'Greek & Roman Revival', 'Islamic', 'Modern', 'Victorian'],
  },
  { slug: 'places', label: 'Places', subs: [] },
  { slug: 'nature', label: 'Nature', subs: ['Coast', 'Desert', 'Forest', 'Lakes & Rivers', 'Mountains'] },
  { slug: 'animals', label: 'Animals', subs: ['Birds', 'Marine', 'Pets', 'Wildlife'] },
  { slug: 'film', label: 'Film', subs: [] },
] as const satisfies readonly { slug: string; label: string; subs: readonly string[] }[];

export type CategorySlug = (typeof categories)[number]['slug'];

// Countries you've photographed. They glow orange on the landing-page globe and are listed
// A–Z on the Places page. `map` is the country's name in the map data. Each city has its real
// longitude/latitude so its pin lands in the right spot (look them up on Google Maps: right-click →
// the numbers shown are lat, lon — note the order here is lon, lat).
// A photo from any tab joins a place via `country:` (and optionally `city:`) in photos.yaml.
export const regions = ['Americas', 'Europe', 'Africa'] as const;

type City = { name: string; lon: number; lat: number };
type Place = { name: string; map: string; region: (typeof regions)[number]; cities: City[] };

export const places: Place[] = [
  { name: 'Austria', map: 'Austria', region: 'Europe', cities: [] },
  { name: 'Costa Rica', map: 'Costa Rica', region: 'Americas', cities: [] },
  {
    name: 'Egypt', map: 'Egypt', region: 'Africa',
    cities: [
      { name: 'Alexandria', lon: 29.92, lat: 31.2 },
      { name: 'Cairo', lon: 31.24, lat: 30.04 },
      { name: 'Luxor', lon: 32.64, lat: 25.69 },
    ],
  },
  {
    name: 'England', map: 'England', region: 'Europe',
    cities: [
      { name: 'Bath', lon: -2.36, lat: 51.38 },
      { name: 'Cambridge', lon: 0.12, lat: 52.21 },
      { name: 'London', lon: -0.13, lat: 51.51 },
      { name: 'New Forest', lon: -1.57, lat: 50.87 },
      { name: 'Oxford', lon: -1.26, lat: 51.75 },
      { name: 'Weymouth', lon: -2.46, lat: 50.61 },
      { name: 'York', lon: -1.08, lat: 53.96 },
    ],
  },
  { name: 'Estonia', map: 'Estonia', region: 'Europe', cities: [] },
  { name: 'Finland', map: 'Finland', region: 'Europe', cities: [] },
  {
    name: 'Germany', map: 'Germany', region: 'Europe',
    cities: [
      { name: 'Berlin', lon: 13.4, lat: 52.52 },
      { name: 'Dresden', lon: 13.74, lat: 51.05 },
    ],
  },
  {
    name: 'Ireland', map: 'Ireland', region: 'Europe',
    cities: [
      { name: 'Clifden', lon: -10.02, lat: 53.49 },
      { name: 'Dingle', lon: -10.27, lat: 52.14 },
      { name: 'Kilkenny', lon: -7.25, lat: 52.65 },
      { name: 'Killarney', lon: -9.51, lat: 52.06 },
    ],
  },
  {
    name: 'Morocco', map: 'Morocco', region: 'Africa',
    cities: [
      { name: 'Casablanca', lon: -7.59, lat: 33.57 },
      { name: 'Fez', lon: -5.0, lat: 34.03 },
      { name: 'Marrakesh', lon: -7.99, lat: 31.63 },
      { name: 'Rabat', lon: -6.84, lat: 34.02 },
    ],
  },
  {
    name: 'Norway', map: 'Norway', region: 'Europe',
    cities: [
      { name: 'Bergen', lon: 5.32, lat: 60.39 },
      { name: 'Oslo', lon: 10.75, lat: 59.91 },
    ],
  },
  { name: 'Panama', map: 'Panama', region: 'Americas', cities: [] },
  {
    name: 'Portugal', map: 'Portugal', region: 'Europe',
    cities: [
      { name: 'Lisbon', lon: -9.14, lat: 38.72 },
      { name: 'Porto', lon: -8.61, lat: 41.15 },
      { name: 'Sintra', lon: -9.39, lat: 38.8 },
    ],
  },
  {
    name: 'Scotland', map: 'Scotland', region: 'Europe',
    cities: [
      { name: 'Cairngorms', lon: -3.64, lat: 57.08 },
      { name: 'Edinburgh', lon: -3.19, lat: 55.95 },
    ],
  },
  { name: 'Spain', map: 'Spain', region: 'Europe', cities: [] },
  {
    name: 'United States', map: 'United States of America', region: 'Americas',
    cities: [
      { name: 'New York', lon: -74.01, lat: 40.71 },
      { name: 'Orange County', lon: -117.83, lat: 33.72 },
      { name: 'Palm Desert', lon: -116.37, lat: 33.72 },
      { name: 'Washington DC', lon: -77.04, lat: 38.91 },
    ],
  },
];

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const byName = (a: string, b: string) => a.localeCompare(b);

/** Places sorted A→Z, each with its cities sorted A→Z. */
export const sortedPlaces = [...places]
  .sort((a, b) => byName(a.name, b.name))
  .map((p) => ({
    ...p,
    slug: slugify(p.name),
    cities: [...p.cities]
      .sort((a, b) => byName(a.name, b.name))
      .map((c) => ({ ...c, slug: slugify(c.name) })),
  }));

export type SortedPlace = (typeof sortedPlaces)[number];

export const sortedSubs = (subs: readonly string[]) => [...subs].sort(byName);
