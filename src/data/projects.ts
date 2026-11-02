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
const cc = (f: string) => `/projects/check-congress/${f}`;

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
    thumbs: [cc('home-sm.webp'), cc('vote-selected-sm.webp'), cc('bill-sm.webp')],
    hero: { kind: 'image', src: cc('home.webp'), alt: 'The Check Congress home page: search, Find your representatives, and topics' },
    why: {
      title: 'Congress works for you. You should be able to check.',
      paras: [
        'A lot happens in Congress, and very little of it is easy to see. Nearly 20,000 bills have been introduced in the 119th Congress, and fewer than 1 in 100 becomes law. The rest stall quietly, and that’s where most of the story is.',
        'Check Congress puts the whole record in one place. It is free and nonpartisan, with no ads, no accounts and no tracking, and its data comes straight from official sources every hour.',
      ],
    },
    sections: [
      {
        title: 'Congress in one weekly page',
        paras: [
          'The home page sums up the week: bills introduced, bills that moved forward, new laws and votes held, each compared with the week before, with the busiest topics and the latest votes a tab away.',
        ],
        media: { kind: 'image', src: cc('week.webp'), alt: 'This week in Congress: bills introduced, moved forward, signed into law and votes held' },
      },
      {
        title: 'Find who represents you',
        paras: [
          'Type an address, a city, a ZIP code or a name, and see your two senators and your member of the House, with how often each votes with their party, how many votes they miss, and their phone number.',
        ],
        media: { kind: 'clip', src: cc('find.mp4'), poster: cc('find-poster.webp'), alt: 'Typing an address and finding its senators and representative' },
      },
      {
        title: 'Every vote, seat by seat',
        paras: [
          'Every House and Senate roll call has its own page. A seat chart of the chamber shows how each member voted; point at a seat to see who sat there and how often they side with their party.',
        ],
        media: { kind: 'clip', src: cc('vote.mp4'), poster: cc('vote-poster.webp'), alt: 'Pointing at seats on a Senate vote’s seat chart' },
      },
      {
        title: 'Follow a bill to law',
        paras: [
          'Each bill shows where it stands, from introduced to committee to both chambers to the President’s desk, with its sponsor, its cosponsors by party, a plain summary and the official text.',
        ],
        media: { kind: 'image', src: cc('bill.webp'), alt: 'A bill page with its status from introduced to law' },
      },
      {
        title: 'Every member’s record',
        paras: [
          'Each member of Congress has a page with how often they vote with their party, how often they show up, how bipartisan their bills are, and every vote they’ve cast.',
        ],
        media: { kind: 'image', src: cc('member.webp'), alt: 'A senator’s page with party loyalty, attendance and bipartisanship' },
      },
      {
        title: 'The numbers behind Congress',
        paras: [
          'Analytics follow the whole Congress: how far bills get (0.81% become law), how many are introduced each month, how often votes split along party lines and who misses the most votes.',
        ],
        media: { kind: 'image', src: cc('analytics.webp'), alt: 'Analytics: 0.81% of bills became law, and how far bills get' },
      },
    ],
    how: {
      title: 'How Check Congress works',
      intro:
        'Check Congress has two halves that share one database. A scheduled data pipeline does all the fetching, parsing and computation ahead of time, and a server-rendered website only reads, so every page shows the latest data without ever calling a government API.',
      stats: [
        { value: '7', label: 'official public data sources' },
        { value: 'Hourly', label: 'automatic updates' },
        { value: '18', label: 'database tables, plus full-text search' },
        { value: '$10', label: 'a year to run, for the domain' },
      ],
      flows: [
        {
          title: 'The data pipeline',
          steps: [
            {
              name: 'Collect',
              text: 'Every hour, a scheduled job pulls public records from GovInfo (Congress.gov’s data), the House Clerk, Voteview at UCLA, the @unitedstates project and the Federal Register. Files that haven’t changed are skipped.',
            },
            {
              name: 'Parse and link',
              text: 'Bulk XML and CSV files are parsed into a local SQLite database, and each vote is linked to its bill, even when the source didn’t connect them.',
            },
            {
              name: 'Derive',
              text: 'Every bill gets a status from its official action codes, from introduced to law or veto. Party-unity scores, missed-vote rates, bipartisanship and site-wide statistics are all computed here, ahead of time.',
            },
            {
              name: 'Index for search',
              text: 'Each bill gets search text from its policy area, subject tags and summaries, so everyday words find bills whose titles don’t contain them. A full-text index ranks the results.',
            },
            {
              name: 'Upload what changed',
              text: 'Changes go to the live database in units, such as a bill with its actions and cosponsors, or a vote with every member’s vote. Each table is fingerprinted, so only what changed is sent.',
            },
            {
              name: 'Stay within budget',
              text: 'Cloudflare’s free plan allows 100,000 database writes a day. The uploader paces 95,000 across the day and learns what each batch really costs, so the site never goes over.',
            },
          ],
        },
        {
          title: 'The website',
          steps: [
            {
              name: 'Built on request',
              text: 'An Astro site on Cloudflare’s global network queries the database for every page, so each one reflects the latest upload. A home page reads about 1,500 rows.',
            },
            {
              name: 'Light by design',
              text: 'Pages are plain HTML and CSS with a few small scripts, and no framework. The state map is drawn in advance from Census boundaries, so no mapping library loads.',
            },
            {
              name: 'Find my rep',
              text: 'A street address goes to the Census Bureau’s geocoder to find its district, a city or ZIP is placed with OpenStreetMap, and a name is matched against all 539 serving members. Addresses are never stored.',
            },
          ],
        },
      ],
      notes: [
        {
          title: 'Plain-English summaries',
          text: 'Bills without an official summary get a plain-English overview with the strongest case for and against, written by a language model from the bill’s official text. 760 bills have one, kept as reviewable files.',
        },
        {
          title: 'No dead ends',
          text: 'A bill number typed any common way, like “hr 1” or “H.R.1”, goes straight to the bill. A bill or vote not in the database yet sends you to its official page instead of an error.',
        },
        {
          title: 'Nothing to sell',
          text: 'Free and nonpartisan, with no ads, no accounts, no cookies and no tracking. It runs on Cloudflare’s free plan, and the only cost is the domain.',
        },
      ],
    },
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
