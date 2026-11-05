// Site-wide settings. Edit these values; no other code needs to change.
export const site = {
  name: 'Nima Movahedi',
  tagline: 'Researcher, builder, photographer',
  intro:
    'Architecture, places, landscapes and animals — mostly on a Canon EOS, with a smaller body of work in film simulation.',
  // The welcome line on the home page, above the region panels.
  welcome:
    'I photograph buildings, cities, wild places and the animals in them, wherever I travel.',
};

// The main page (/): what follows "I am a …", where you are, and the icon links.
// A link with an empty href is hidden until you fill it in.
export const home = {
  tagline: 'Researcher, builder, photographer',
  roles: ['researcher', 'builder', 'photographer', 'backpacker', 'designer', 'graduate student'],
  location: 'Currently in Irvine, CA.',
  links: [
    { icon: 'email', label: 'Email', href: 'mailto:movahedn@uci.edu' },
    { icon: 'github', label: 'GitHub', href: 'https://github.com/nimammovahedi-del' },
    { icon: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/nima-movahedi/' },
    { icon: 'cv', label: 'CV (PDF)', href: '' },
  ],
};

// Sub-tabs for each subject. Add or rename freely — they're shown alphabetically.
// A photo joins a sub-tab via `sub:` in photos.yaml.
export const categories = [
  {
    slug: 'architecture',
    label: 'Architecture',
    subs: [
      'Castles & Country Houses',
      'Churches & Cathedrals',
      'Colourful Terraces',
      'Georgian & Classical',
      'Modern',
      'Monuments',
      'Victorian & Glasshouses',
      'Wooden Houses',
    ],
  },
  { slug: 'places', label: 'Places', subs: [] },
  {
    slug: 'nature',
    label: 'Nature',
    subs: [
      'Coast',
      'Countryside',
      'Fjords',
      'Flowers',
      'Forest',
      'Lakes & Rivers',
      'Mountains',
      'Skies & Weather',
      'Waterfalls',
    ],
  },
  { slug: 'animals', label: 'Animals', subs: ['Birds', 'Farm Animals'] },
  { slug: 'film', label: 'Film', subs: [] },
] as const satisfies readonly { slug: string; label: string; subs: readonly string[] }[];

export type CategorySlug = (typeof categories)[number]['slug'];

// Countries you've photographed. They glow orange on the landing-page globe and are listed
// A–Z on the Places page. `map` is the country's name in the map data. Each city has its real
// longitude/latitude so its pin lands in the right spot (look them up on Google Maps: right-click →
// the numbers shown are lat, lon — note the order here is lon, lat).
// A photo from any tab joins a place via `country:` (and optionally `city:`) in photos.yaml.
export const regions = ['America', 'Europe', 'Africa'] as const;

type City = { name: string; lon: number; lat: number };
type Place = { name: string; map: string; region: (typeof regions)[number]; cities: City[] };

export const places: Place[] = [
  { name: 'Austria', map: 'Austria', region: 'Europe', cities: [] },
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
  {
    name: 'Finland', map: 'Finland', region: 'Europe',
    cities: [{ name: 'Helsinki', lon: 24.94, lat: 60.17 }],
  },
  {
    name: 'Germany', map: 'Germany', region: 'Europe',
    cities: [
      { name: 'Berlin', lon: 13.4, lat: 52.52 },
      { name: 'Dresden', lon: 13.74, lat: 51.05 },
      { name: 'Munich', lon: 11.58, lat: 48.14 },
    ],
  },
  {
    name: 'Ireland', map: 'Ireland', region: 'Europe',
    cities: [
      { name: 'Clifden', lon: -10.02, lat: 53.49 },
      { name: 'Cork', lon: -8.47, lat: 51.9 },
      { name: 'Dingle', lon: -10.27, lat: 52.14 },
      { name: 'Dublin', lon: -6.26, lat: 53.35 },
      { name: 'Galway', lon: -9.05, lat: 53.27 },
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
      { name: 'Flåm', lon: 7.11, lat: 60.86 },
      { name: 'Oslo', lon: 10.75, lat: 59.91 },
      { name: 'Sognefjord', lon: 6.6, lat: 61.12 }, // the main fjord, north-west of Flåm
    ],
  },
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
      { name: 'Stirling', lon: -3.94, lat: 56.12 },
    ],
  },
  { name: 'Spain', map: 'Spain', region: 'Europe', cities: [] },
  {
    name: 'United States', map: 'United States of America', region: 'America',
    cities: [
      { name: 'New York', lon: -74.01, lat: 40.71 },
      { name: 'Orange County', lon: -117.83, lat: 33.72 },
      { name: 'Palm Desert', lon: -116.37, lat: 33.72 },
      { name: 'Philadelphia', lon: -75.17, lat: 39.95 },
      { name: 'Red Rock Canyon', lon: -115.43, lat: 36.13 }, // Nevada, west of Las Vegas
      { name: 'Seattle', lon: -122.33, lat: 47.61 },
      { name: 'Washington DC', lon: -77.04, lat: 38.91 },
      { name: 'Yosemite', lon: -119.57, lat: 37.74 }, // Yosemite Valley, California
    ],
  },
];

export const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // Flåm → flam
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

// The About page (top menu). A first draft from what's on the site; rewrite freely.
// About page, right-hand column. Change the book, song, rank or set whenever you like.
// Images live in public/about/.
export const aboutNow = {
  reading: { title: 'Dune', by: 'Frank Herbert', cover: '/about/dune.jpg' },
  listening: { title: 'Black', by: 'Pearl Jam', album: 'Ten', cover: '/about/ten.jpg' },
  rank: { game: 'Overwatch 2', rank: 'Diamond 2', icon: '/about/ow-diamond.png' },
  lego: {
    name: 'UCS Venator-Class Republic Attack Cruiser',
    set: '75367',
    image: '/about/venator.png',
  },
};

// About page, "Along the way" list (newest first).
export const aboutPath = [
  { year: '2026', place: 'London School of Economics and Political Science', href: 'https://www.lse.ac.uk/', what: 'Political Science' },
  { year: '2025', place: 'University of California, Irvine', href: 'https://uci.edu/', what: 'Political Science and History' },
  { year: '2022', place: 'Freie Universität Berlin', href: 'https://www.fu-berlin.de/en/', what: 'History' },
];

// Each paragraph has a full version (desktop) and a short one (iPhone, about 30% less text).
export const about = [
  {
    full: 'Hi, I&rsquo;m Nima. Right now I&rsquo;m finishing my master&rsquo;s in political science at the London School of Economics, a year after graduating from UC Irvine, and the next step I&rsquo;m hoping for is law school.',
    short: 'Hi, I&rsquo;m Nima. I&rsquo;m finishing my political science master&rsquo;s at the LSE, a year after graduating from UC Irvine, and hoping for law school next.',
  },
  {
    full: 'On the side I build free <a href="/projects">apps</a>: Ergo, for drilling LSAT logical reasoning; Check Congress, for keeping up with what Congress actually does; and Federal Money Atlas, for seeing how much federal money comes back to every county.',
    short: 'On the side I build free <a href="/projects">apps</a>: Ergo, for drilling LSAT logical reasoning; Check Congress, for keeping up with what Congress actually does; and Federal Money Atlas, for seeing how much federal money comes back to every county.',
  },
  {
    full: 'In my free time I design my own LEGO builds, go backpacking, follow architecture and new urban and transit developments, and play video games like Cyberpunk 2077 and Overwatch. I also take photos wherever I travel, and you can find that art, along with the <a href="/photography/cameras">cameras</a> I shoot on, under <a href="/photography">Photography</a>.',
    short: 'In my free time I design LEGO, go backpacking, follow architecture and transit, and play Cyberpunk 2077 and Overwatch. My travel photos are under <a href="/photography">Photography</a>.',
  },
];
