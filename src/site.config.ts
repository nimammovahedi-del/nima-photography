// Site-wide settings. Edit these values; no other code needs to change.
export const site = {
  name: 'Nima Movahedi',
  tagline: 'Photography',
  intro:
    'Architecture, places, landscapes and animals — mostly on a Canon EOS, with a smaller body of work in film simulation.',
  email: '', // optional public email shown on Contact — leave empty to hide
  instagram: '', // e.g. 'https://instagram.com/yourname' — leave empty to hide
  formspreeEndpoint: 'https://formspree.io/f/mjykrzlz',
  // Cover photos for the About and Contact buttons on the landing page (paths inside src/photos/).
  covers: {
    about: 'nature/placeholder-02.jpg',
    contact: 'places/placeholder-05.jpg',
  },
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

// Countries you've photographed. They're highlighted on the landing-page map and listed
// alphabetically on the Places page. `map` is the country's name in the map data.
// A photo from any category joins a place via `country:` (and optionally `city:`) in photos.yaml.
export const places = [
  { name: 'Austria', map: 'Austria', cities: [] },
  { name: 'Costa Rica', map: 'Costa Rica', cities: [] },
  { name: 'Egypt', map: 'Egypt', cities: ['Alexandria', 'Cairo', 'Luxor'] },
  {
    name: 'England',
    map: 'England',
    cities: ['Bath', 'Cambridge', 'London', 'New Forest', 'Oxford', 'Weymouth', 'York'],
  },
  { name: 'Estonia', map: 'Estonia', cities: [] },
  { name: 'Finland', map: 'Finland', cities: [] },
  { name: 'Germany', map: 'Germany', cities: ['Berlin', 'Dresden'] },
  { name: 'Ireland', map: 'Ireland', cities: ['Clifden', 'Dingle', 'Kilkenny', 'Killarney'] },
  { name: 'Morocco', map: 'Morocco', cities: ['Casablanca', 'Fez', 'Marrakesh', 'Rabat'] },
  { name: 'Norway', map: 'Norway', cities: ['Bergen', 'Oslo'] },
  { name: 'Panama', map: 'Panama', cities: [] },
  { name: 'Portugal', map: 'Portugal', cities: ['Lisbon', 'Porto', 'Sintra'] },
  { name: 'Scotland', map: 'Scotland', cities: ['Cairngorms', 'Edinburgh'] },
  { name: 'Spain', map: 'Spain', cities: [] },
  {
    name: 'United States',
    map: 'United States of America',
    cities: ['New York', 'Orange County', 'Palm Desert', 'Washington DC'],
  },
] as const;

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
  .map((p) => ({ ...p, slug: slugify(p.name), cities: [...p.cities].sort(byName) }));

export const sortedSubs = (subs: readonly string[]) => [...subs].sort(byName);
