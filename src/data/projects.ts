// The Projects page: one compact row per app, in this order, and a page per app at
// /projects/<slug>. Screenshots and clips are real captures of the live sites, kept in
// public/projects/<slug>/.

export type Media =
  | { kind: 'image'; src: string; alt: string }
  /** A short muted clip. It never plays on its own: pressing it plays it. */
  | { kind: 'clip'; src: string; poster: string; alt: string };

export interface Section {
  title: string;
  paras: string[];
  media?: Media;
}

export interface Step {
  name: string;
  text: string;
}

export interface HowItWorks {
  title: string;
  intro: string;
  stats: { value: string; label: string }[];
  /** Each flow is drawn as a row of steps, then explained step by step. */
  flows: { title: string; steps: Step[] }[];
  /** Closing paragraphs, each with a short heading. */
  notes: { title: string; text: string }[];
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
  /** Small screenshots for the row; they take turns while the row is hovered. */
  thumbs: string[];
  /** The big screenshot at the top of the project's page. */
  hero?: Media;
  why?: { title: string; paras: string[] };
  sections: Section[];
  how?: HowItWorks;
}

const ergo = (f: string) => `/projects/ergo/${f}`;

export const projects: Project[] = [
  {
    slug: 'ergo',
    name: 'Ergo',
    summary:
      "Free practice for the Logical Reasoning half of the LSAT, with no account and nothing to pay. You drill original questions by type and difficulty with every answer explained, then sharpen one skill at a time in short games. Your stats show exactly where you're losing points.",
    tags: ['Free', 'No sign-up', 'LSAT'],
    url: 'https://lr-drill.lr-drill-site.workers.dev/',
    urlLabel: 'Open Ergo',
    tagline: 'Free LSAT Logical Reasoning practice, explained as you go.',
    thumbs: [ergo('home-sm.webp'), ergo('explained-sm.webp'), ergo('stats-sm.webp')],
    hero: { kind: 'image', src: ergo('home.webp'), alt: "Ergo's home page: \"Destroy the argument.\" with Drill, Games, Stats and Learn below" },
    why: {
      title: "Prep shouldn't cost more than the test",
      paras: [
        'Doing well on the LSAT, and getting into law school, shouldn’t depend on whether you can pay for a course. Most prep costs far more than the test itself, so Ergo is free, needs no account, and keeps your progress in your own browser.',
        'I also wanted a better way to review the logic itself. Ergo turns the core moves of Logical Reasoning into short games, something none of the big prep companies do.',
      ],
    },
    sections: [
      {
        title: 'Drill exactly what you need',
        paras: [
          'Build a drill from any of the eight question types, from Weaken and Flaw to Paradox, at five levels of difficulty. Or press Quick random and start straight away.',
        ],
        media: { kind: 'image', src: ergo('build.webp'), alt: 'The Build a drill panel with modes, levels and question types' },
      },
      {
        title: 'Every answer, explained',
        paras: [
          'The moment you answer, Ergo shows why the right choice works and why yours doesn’t, with a one-line takeaway to remember. Questions you miss come back in Mistake review until you get them right.',
        ],
        media: { kind: 'clip', src: ergo('drill.mp4'), poster: ergo('drill-poster.webp'), alt: 'Answering a question and reading the explanation' },
      },
      {
        title: 'Games no one else makes',
        paras: [
          'Seven quick games each train a single habit: negate a statement exactly, tap the conclusion, mark indicator words, translate into if-then form, or name a question type against the clock.',
        ],
        media: { kind: 'clip', src: ergo('negate.mp4'), poster: ergo('negate-poster.webp'), alt: 'Playing Negate it: picking the exact denial of a statement' },
      },
      {
        title: 'Timed like test day',
        paras: [
          'A timed section gives you 25 questions in 35 minutes, the pace of the real exam, with flags and a question map. Blitz runs questions against a clock you set, from one to twenty minutes.',
        ],
        media: { kind: 'image', src: ergo('timed.webp'), alt: 'A timed section with the 35-minute clock and the question map' },
      },
      {
        title: 'Know where you lose points',
        paras: [
          'Stats track your first-try accuracy over time, by question type and by level, along with your pace and your timed scores. Ergo points out your weakest type so you know what to drill next.',
        ],
        media: { kind: 'image', src: ergo('stats.webp'), alt: 'The Stats page with accuracy over time and accuracy by question type (sample data)' },
      },
      {
        title: 'Learn the methods',
        paras: [
          'Short guides walk through each question type with a worked example, and flashcard decks cover indicator words, flaw names, negations and conditionals.',
        ],
        media: { kind: 'image', src: ergo('guide.webp'), alt: 'The Flaw method guide' },
      },
    ],
    how: {
      title: 'How Ergo works',
      intro:
        'Ergo has two halves: a question pipeline that writes and verifies every question with machine-learning models before a person sees it, and a fully static website that serves the approved questions with no backend at all.',
      stats: [
        { value: '103', label: 'questions live, across 8 types' },
        { value: '24', label: 'static pages' },
        { value: '0', label: 'servers or databases' },
        { value: '~20k', label: 'lines of TypeScript, Astro and CSS' },
      ],
      flows: [
        {
          title: 'The question pipeline',
          steps: [
            {
              name: 'Specification',
              text: 'Each question type has a written spec: what the right answer must do, the classic wrong-answer patterns, and what makes a question harder. The argument’s gap is designed before any answer choice is written.',
            },
            {
              name: 'Seeded plan',
              text: 'A script fixes every question’s answer letter, difficulty, topic and answer length from a random seed, so the answer key can’t drift into patterns a test-taker could exploit.',
            },
            {
              name: 'Generation',
              text: 'Large language model agents, one per question type, write each batch against its spec and run its self-checks until it passes the linter.',
            },
            {
              name: 'Baseline solvers',
              text: 'The linter checks structure, length and wording rules, then runs naive solvers that always pick the longest or the most hedged answer. They must score no better than chance.',
            },
            {
              name: 'Answer-only test',
              text: 'A model sees only the question and the choices, without the argument. If it still finds the answer with confidence, the answer gives itself away and the question goes back.',
            },
            {
              name: 'Independent solvers',
              text: 'Two different models solve each question blind and report their confidence, their runner-up and the difficulty. Any disagreement or doubt flags the question.',
            },
            {
              name: 'Adversarial review',
              text: 'A separate model argues for every wrong answer on flagged questions and proposes fixes. The writer gets one revision, and anything still flagged is held back, not shipped.',
            },
          ],
        },
        {
          title: 'The website',
          steps: [
            {
              name: 'Static build',
              text: 'An Astro build turns the approved questions into plain HTML, CSS and small TypeScript scripts, with no UI framework.',
            },
            {
              name: 'Edge hosting',
              text: 'The pages are served from Cloudflare’s global network. Nothing calls a model or a server while you practise.',
            },
            {
              name: 'Your browser',
              text: 'Your answers, stats and mistake list live only in your browser’s storage. No account, and no data leaves your device.',
            },
          ],
        },
      ],
      notes: [
        {
          title: 'Better with every batch',
          text: 'The first batch took three rounds to ship 30 questions. Later batches shipped 35 of 40 and then 38 of 40, using about half as many model runs per question.',
        },
        {
          title: 'A clock you can’t cheat',
          text: 'Timed sections store a deadline rather than a countdown, so reloading the page, closing the tab or pressing Back can’t pause or reset it.',
        },
        {
          title: 'Tested like a product',
          text: 'Every round of interface work is reviewed by automated testers on phone, landscape and desktop sizes, in both themes, with a keyboard and a screen reader. A separate reviewer checks the logic of every item in the games.',
        },
      ],
    },
  },
  {
    slug: 'check-congress',
    name: 'Check Congress',
    summary:
      'A free, nonpartisan record of every bill, vote and member of the 119th Congress, refreshed every hour from official sources. Find your representatives from your address, see how each one voted on a seat chart, and follow any bill to law. No ads, no accounts and no tracking.',
    tags: ['Free', 'Nonpartisan', 'Updated hourly'],
    url: 'https://checkcongress.com/',
    urlLabel: 'Visit checkcongress.com',
    tagline: 'Every bill, vote and member of Congress, in plain view.',
    thumbs: [],
    why: {
      title: 'Congress works for you. You should be able to check.',
      paras: [
        'A lot happens in Congress, and very little of it is easy to see. Nearly 20,000 bills have been introduced in the 119th Congress, and fewer than 1 in 100 becomes law. The rest stall quietly, and that’s where most of the story is.',
        'Check Congress is free, nonpartisan, has no ads and no tracking, and takes its data straight from official sources every hour.',
      ],
    },
    sections: [
      {
        title: 'Congress in one weekly page',
        paras: ['The home page sums up the week: bills introduced, bills that moved forward, new laws and votes held, each compared with the week before.'],
      },
      {
        title: 'Find who represents you',
        paras: ['Type where you live and see your senators and your member of the House, with how often they vote with their party and how many votes they miss.'],
      },
      {
        title: 'Every vote, seat by seat',
        paras: ['Every House and Senate roll call has its own page with a seat chart of the chamber, the tally and how each member voted.'],
      },
      {
        title: 'Follow a bill to law',
        paras: ['Each bill shows where it stands, from introduced to committee to the floor to signed, with its sponsors, its summary and the official text.'],
      },
      {
        title: 'The numbers behind Congress',
        paras: ['Analytics show how few bills become law, how often votes split along party lines and who misses the most votes.'],
      },
    ],
  },
  {
    slug: 'brick-rater',
    name: 'Brick Rater',
    summary:
      'LEGO has been a hobby of mine for as long as I can remember. Brick Rater will show buyers how set prices have changed and what a set is really worth, so they know when they’re getting good value. It’s still being built.',
    tags: ['In development'],
    tagline: 'Know what a LEGO set is really worth.',
    thumbs: [],
    why: {
      title: 'Know what a set is really worth',
      paras: [
        'LEGO has always been a hobby of mine. Prices change a lot, before and after a set retires, and most buyers never see it. Brick Rater will show how a set’s price has moved and how to get the most for your money.',
      ],
    },
    sections: [],
  },
];
