// Site-wide settings. Edit these values; no other code needs to change.
export const site = {
  name: 'Nima Movahedi',
  tagline: 'Photography',
  intro:
    'Architecture, cities, landscapes and animals — mostly on a Canon EOS, with a smaller body of work in film simulation.',
  email: '', // optional public email shown on Contact — leave empty to hide
  instagram: '', // e.g. 'https://instagram.com/yourname' — leave empty to hide
  formspreeEndpoint: 'https://formspree.io/f/mjykrzlz',
};

export const categories = [
  { slug: 'architecture', label: 'Architecture' },
  { slug: 'cities', label: 'Cities' },
  { slug: 'nature', label: 'Nature' },
  { slug: 'animals', label: 'Animals' },
  { slug: 'film', label: 'Film' },
] as const;

export type CategorySlug = (typeof categories)[number]['slug'];
