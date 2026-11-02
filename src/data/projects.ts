// The Projects page: one row per app, in this order. Each app with a `url` also gets its own page
// at /projects/<slug> with a demo video and a section per feature.
//
// Videos: drop the files on R2 (photos.nimamovahedi.com/projects/...) and fill `video` and each
// feature's `clip`. Until then the page shows the app's drawing in their place.

export interface Feature {
  title: string;
  text: string;
  /** A few-second clip of just this feature (mp4). Plays only when pressed. */
  clip?: string;
}

export interface Project {
  slug: 'ergo' | 'check-congress' | 'brick-rater';
  name: string;
  /** Three sentences, shown on the Projects row. */
  summary: string;
  tags: string[];
  /** The live site. Absent = "Coming soon". */
  url?: string;
  urlLabel?: string;
  /** One line under the name on the project's own page. */
  tagline: string;
  /** The full demo (mp4) and its poster frame. */
  video?: string;
  poster?: string;
  features: Feature[];
}

export const projects: Project[] = [
  {
    slug: 'ergo',
    name: 'Ergo',
    summary:
      'Ergo is free practice for the Logical Reasoning half of the LSAT, with no sign-up and nothing to pay. You drill original questions by type and difficulty, get an explanation the moment you answer, and see your misses come back until you get them right. Short games train one skill at a time, like negating a statement or finding the conclusion, and your stats show where you lose points.',
    tags: ['Free', 'No sign-up', 'LSAT'],
    url: 'https://lr-drill.lr-drill-site.workers.dev/',
    urlLabel: 'Open Ergo',
    tagline: 'Free LSAT Logical Reasoning practice, explained as you go.',
    features: [
      {
        title: 'Drill your weak spots',
        text: 'Build a drill from 103 original questions: pick any of the eight question types, from Weaken and Flaw to Paradox, and a difficulty from L1 to L5. Every answer is explained as you go, and Mistake review keeps bringing back the ones you missed.',
      },
      {
        title: 'Timed like the real test',
        text: 'Switch to a timed section of 25 questions against a 35-minute clock, the same pace as the LSAT. Blitz runs questions against a clock you set, from one to twenty minutes.',
      },
      {
        title: 'Games that train one skill',
        text: 'Eight quick games each isolate one habit: name the question type in a 60-second sprint, tap the conclusion, mark indicator words, negate a statement exactly, or translate it into if-then form.',
      },
      {
        title: 'See where you lose points',
        text: 'Stats track your accuracy, your pace and your weakest question types. Progress stays in your own browser, so there is no account to make.',
      },
      {
        title: 'Learn the methods',
        text: 'Short guides walk through each method with a worked example, and flashcard decks cover indicator words, flaw names, negations and conditional translations. Cards you miss come back.',
      },
    ],
  },
  {
    slug: 'check-congress',
    name: 'Check Congress',
    summary:
      'Check Congress follows every bill, vote and member of the U.S. Congress, free and nonpartisan. It refreshes every hour from official sources and opens on a plain summary of what happened this week. You can find your own representatives from your address, see how each member voted on a seat chart, and follow any bill from introduction to law.',
    tags: ['Free', 'Nonpartisan', 'Updated hourly'],
    url: 'https://checkcongress.com/',
    urlLabel: 'Visit checkcongress.com',
    tagline: 'Every bill, vote and member of Congress, in plain view.',
    features: [
      {
        title: 'This week in Congress',
        text: 'The home page sums up the week: bills introduced, bills that moved forward, new laws and votes held, each compared with the week before, plus the topics with the most activity.',
      },
      {
        title: 'Find your representatives',
        text: 'Type where you live and see who represents you in the House and the Senate, or pick your state from a map.',
      },
      {
        title: 'See how everyone voted',
        text: 'Every House and Senate roll call has its own page with a seat chart of the chamber, the tally by party, and how each member voted. Filter the full list by chamber, result and type of vote.',
      },
      {
        title: 'Follow a bill to law',
        text: 'Each bill shows where it stands, from introduced to committee to the floor to signed, with its sponsors, its summary and a link to the official text. Browse them by 31 policy topics.',
      },
      {
        title: 'The numbers behind Congress',
        text: 'Analytics show how few bills become law (under 1%), how often votes split along party lines, who votes with their party least, and who misses the most votes.',
      },
    ],
  },
  {
    slug: 'brick-rater',
    name: 'Brick Rater',
    summary:
      'Brick Rater will tell you whether a LEGO set is worth its price. It weighs what you get in the box against what you pay for it. It is still being built, so there is nothing to try yet.',
    tags: ['In development'],
    tagline: 'Is this LEGO set worth it? Still being built.',
    features: [],
  },
];
