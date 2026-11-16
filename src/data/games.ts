// The Games page: one big featured card (the game in development) above a card per finished game.
// A finished game has its own page at /games/<slug>. Captures are kept in public/games/<slug>/.

export interface Game {
  slug: string;
  name: string;
  /** One or two sentences for the card. */
  summary: string;
  tags: string[];
  /** Where to play it. Absent = still in development. */
  url?: string;
  /** The card's picture. */
  thumb?: string;
  /** Shown big at the top of the page, above the other games. */
  featured?: boolean;
}

export const games: Game[] = [
  {
    slug: 'umbara',
    name: 'Umbara',
    summary:
      'My next game, and a much bigger one than Capy Time. It is in development now, and it will get its own page once there is something to show.',
    tags: ['In development'],
    featured: true,
  },
  {
    slug: 'capy-time',
    name: 'Capy Time',
    summary:
      'A small, calm evening at the zoo, as a capybara. A cozy 3D game for the browser, on a computer or a phone, with no score and no way to lose.',
    tags: ['Free', 'Browser', 'Desktop and phone'],
    url: 'https://capytime.pages.dev/',
    thumb: '/games/capy-time/den-sm.webp',
  },
];
