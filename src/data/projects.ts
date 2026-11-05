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
  /** A real calculation walked through from start to finish, drawn as sums. */
  example?: Example;
  /** Closing paragraphs, each with a short heading. */
  notes: { title: string; text: string }[];
}

export interface Example {
  title: string;
  intro: string;
  /** Each sum: terms added together, then its total. */
  sums: { terms: { label: string; value: string }[]; total: { label: string; value: string } }[];
  /** The last line, the answer the sums lead to. */
  answer: string;
}

export interface Project {
  slug: 'ergo' | 'check-congress' | 'fed-money' | 'brick-rater';
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
const fm = (f: string) => `/projects/fed-money/${f}`;

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
    slug: 'fed-money',
    name: 'Federal Money Atlas',
    summary:
      'For every $1 a county’s residents pay in federal taxes, how much federal money comes back? Federal Money Atlas answers that for all 3,144 US counties, counting Social Security, grants and contracts from public data. Search your county, explore the map, or compare two places side by side.',
    tags: ['Free', 'Nonpartisan', '3,144 counties'],
    url: 'https://fedmoney.pages.dev/',
    urlLabel: 'Open Federal Money Atlas',
    tagline: 'How much federal money comes back to every US county, for each $1 of tax.',
    thumbs: [fm('home-sm.webp'), fm('map-sm.webp'), fm('county-sm.webp')],
    hero: { kind: 'image', src: fm('home.webp'), alt: 'The Federal Money Atlas home page: "What does $1 get you?" with a county search' },
    why: {
      title: 'One fair number for every county',
      paras: [
        'Arguments about which places “give” and which “take” from Washington are everywhere, but they are usually about states, and they rarely show their working. I wanted to see it county by county, with every number traceable to a public source.',
        'Federal Money Atlas does one division, the same way for every county, and always shows the result next to the national figure and the typical county. It is free and nonpartisan: no red or blue, no winners or losers, and every estimate is labeled.',
      ],
    },
    sections: [
      {
        title: 'Every county on one line',
        paras: [
          'The home page lines up all 3,143 counties with a figure, from the least money back per $1 to the most. The typical county gets $1.12 back, while the country as a whole gets $0.73, because the places that pay the most get back far less.',
        ],
        media: { kind: 'image', src: fm('chart.webp'), alt: 'Every county from lowest to highest dollars back per $1, and how many counties fall in each range' },
      },
      {
        title: 'A map you can take apart',
        paras: [
          'Show all federal money or just one kind of it, filter counties by population or by dollars back, and switch between a land map, a map sized by people, and an even grid where every county counts the same.',
        ],
        media: { kind: 'clip', src: fm('map.mp4'), poster: fm('map-poster.webp'), alt: 'Switching the map between kinds of money and between the Land, People and Grid views' },
      },
      {
        title: 'Your county, in one number',
        paras: [
          'Type a county and its page leads with one figure, how much comes back for every $1 of tax, beside the typical county. Below it are its ranks and the top recipients, agencies and programs, pulled live from USAspending, with a button to cite the page.',
        ],
        media: { kind: 'clip', src: fm('search.mp4'), poster: fm('search-poster.webp'), alt: 'Searching for Franklin County, Ohio and opening its page' },
      },
      {
        title: 'Two places, side by side',
        paras: [
          'Compare any two counties on money back, money in and taxes paid per person, and how much of it is Social Security. Every comparison has its own link to share.',
        ],
        media: { kind: 'image', src: fm('compare.webp'), alt: 'Franklin County, Ohio and Pima County, Arizona compared side by side' },
      },
      {
        title: 'The bigger picture',
        paras: [
          'Analytics put every county on one chart, with what residents paid per person against what came back, alongside the mix of money by type and five years of totals. All the figures download as a single CSV.',
        ],
        media: { kind: 'image', src: fm('analytics.webp'), alt: 'A scatter chart of taxes paid per person against money in per person for every county' },
      },
      {
        title: 'Every step shown',
        paras: [
          'A Method page walks through the calculation with a real county, lists every source and its year, shows how the totals were checked, and keeps a version number and a changelog so any figure can be cited.',
        ],
        media: { kind: 'image', src: fm('method.webp'), alt: 'The worked example for Franklin County, Ohio on the Method page' },
      },
    ],
    how: {
      title: 'How Federal Money Atlas works',
      intro:
        'Every figure is one division: federal money that came into a county in fiscal year 2023, divided by the federal taxes its residents paid. A Python pipeline does all the counting ahead of time from public files, and a static website shows the results.',
      stats: [
        { value: '12.9M', label: 'federal transactions read, for fiscal year 2023' },
        { value: '$3.14T', label: 'counted: 44% Social Security, 35% grants, 21% contracts' },
        { value: '$1.12', label: 'back per $1 in the typical county, against $0.73 for the U.S.' },
        { value: '3,152', label: 'static pages, one for every county' },
      ],
      flows: [
        {
          title: 'Money in',
          steps: [
            {
              name: 'Read every award',
              text: 'The pipeline downloads USAspending’s full files for the year, about 3.3 GB, and reads all 12.9 million contract, grant and payment transactions. It counts Social Security and SSI, grants and contracts, as committed that year.',
            },
            {
              name: 'Where the money lands',
              text: 'Money goes to the county where the work happens or the payment is made, not where the company or agency has its office. Only the main award is counted, never the sub-awards inside it, so nothing is counted twice.',
            },
            {
              name: 'Set aside national contracts',
              text: 'Four nationwide health-benefit contracts for veterans’ care and TRICARE, $35.6 billion in all, are booked to the contractor’s office. They are moved to their own line, which takes Spotsylvania County, Virginia from $14.85 back per $1 to $0.69.',
            },
            {
              name: 'Share statewide grants by need',
              text: 'About three-quarters of grant money, mostly Medicaid, goes to a state with no county attached. Each county gets a share by the people each program serves: Medicaid by people covered, school programs by children, TANF and child care by people in poverty, food programs by SNAP households, and the rest by population. These are labeled “est.”',
            },
          ],
        },
        {
          title: 'Taxes paid',
          steps: [
            {
              name: 'Start from the Treasury',
              text: 'The total is the Treasury’s $4.44 trillion in federal receipts for fiscal year 2023. 97.3% of it is shared out to counties; customs and other receipts are left out, as in the Rockefeller Institute’s state study.',
            },
            {
              name: 'Income tax, measured',
              text: 'Each county’s share of income tax comes straight from the IRS’s county data for tax year 2023, including the net investment income tax.',
            },
            {
              name: 'Payroll tax, estimated',
              text: 'Payroll taxes follow an estimate of each county’s taxable wages, with the Social Security wage cap applied to high earners, plus self-employment tax and the additional Medicare tax.',
            },
            {
              name: 'Everything else',
              text: 'Corporate tax is shared 75% by investment income and 25% by wages. Estate tax follows investment income and excise taxes follow population.',
            },
          ],
        },
        {
          title: 'The website',
          steps: [
            {
              name: 'Build the data',
              text: 'Python scripts write a spreadsheet with every county, the checks and the sources, then turn it into the small data files the site reads. The same rules rebuild all five years, 2019 to 2023.',
            },
            {
              name: 'Static pages',
              text: 'An Astro build writes 3,152 plain pages, one for every county, in about a second. Map shapes and chart code are served with the site, so nothing loads from elsewhere.',
            },
            {
              name: 'Edge hosting',
              text: 'Cloudflare Pages serves the site and publishes a new version on every push. Only the top recipients on a county page come live from the USAspending API, in your browser.',
            },
            {
              name: 'Monthly refresh, planned',
              text: 'The data is from USAspending’s files of October 2026. A free scheduled job that rebuilds the site each month from USAspending’s updates is planned next.',
            },
          ],
        },
      ],
      example: {
        title: 'A worked example: Franklin County, Ohio',
        intro: 'Franklin County, home to Columbus and 1.34 million people, run through the whole calculation.',
        sums: [
          {
            terms: [
              { label: 'Social Security & SSI', value: '$3.9B' },
              { label: 'Grants (incl. $3.6B est.)', value: '$6.6B' },
              { label: 'Contracts', value: '$0.9B' },
            ],
            total: { label: 'Money in', value: '$11.4B' },
          },
          {
            terms: [
              { label: 'Income tax', value: '$7.1B' },
              { label: 'Payroll (est.)', value: '$6.4B' },
              { label: 'Other (est.)', value: '$1.6B' },
            ],
            total: { label: 'Taxes paid', value: '$15.1B' },
          },
        ],
        answer:
          '$11.4B ÷ $15.1B = $0.75 back for every $1, below the typical county’s $1.12. That ranks Franklin 2,530th of 3,143. Its contracts would be seven times larger counted by where companies are based, which is why the location rule matters.',
      },
      notes: [
        {
          title: 'Checked against outside numbers',
          text: 'Social Security in the data is within 0.3% of the Treasury’s payments, contracts match USAspending’s published $760 billion, and state results line up with the Rockefeller Institute’s study at a correlation of 0.97.',
        },
        {
          title: 'Nonpartisan by design',
          text: 'No red or blue, no party colors and no “giver” or “taker” language. Social Security is shown as an earned benefit, and every county gets the same method.',
        },
        {
          title: 'Honest about its limits',
          text: 'Medicare, federal salaries and interest on the debt aren’t tied to a county, which is why the U.S. figure is under $1. Estimates are labeled, and each data release has a version number to cite.',
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
