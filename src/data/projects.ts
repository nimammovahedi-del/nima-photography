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
  /** Each sum: terms joined by + (or × where a term says so), then its total. */
  sums: { terms: { label: string; value: string; op?: '+' | '×' }[]; total: { label: string; value: string } }[];
  /** The last line, the answer the sums lead to. */
  answer: string;
}

export interface Project {
  slug: 'ergo' | 'check-congress' | 'fairclaim' | 'fed-money' | 'best-bricks';
  name: string;
  /** Three sentences, shown on the Projects row. */
  summary: string;
  tags: string[];
  /** The live site. Absent = "Coming soon". */
  url?: string;
  urlLabel?: string;
  /** A second link on the project's own page, beside the main button. */
  more?: { label: string; url: string };
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
const fc = (f: string) => `/projects/fairclaim/${f}`;
const fm = (f: string) => `/projects/fed-money/${f}`;
const bb = (f: string) => `/projects/best-bricks/${f}`;

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
    slug: 'fairclaim',
    name: 'Fair Claim',
    summary:
      'Is it worth taking someone to small claims court, and how do you do it? Fair Claim explains the five steps and gives the rules for all 50 states and DC, each with its source and the date it was checked. A cost calculator, a demand-letter writer and printable checklists help you decide and prepare.',
    tags: ['Free', 'No sign-up', '50 states + DC'],
    url: 'https://fairclaim.pages.dev/',
    urlLabel: 'Open Fair Claim',
    more: { label: 'Try the tools', url: 'https://fairclaim.pages.dev/tools/' },
    tagline: 'Small claims court, explained, with a source for every rule.',
    thumbs: [fc('home-sm.webp'), fc('calculator-sm.webp'), fc('letter-sm.webp')],
    hero: { kind: 'image', src: fc('home.webp'), alt: 'The Fair Claim home page: "Small claims, explained." with a search for your state’s rules' },
    why: {
      title: 'Information that isn’t selling anything',
      paras: [
        'Small claims court can settle a money dispute without a lawyer, like a deposit a landlord kept, a refund a business won’t give or an invoice nobody paid. It can also cost more than it returns, and winning doesn’t mean being paid. Most guides either push you to sue or bury the rules in legal language.',
        'Fair Claim is calm and neutral. It won’t talk you into suing, or out of it: the costs and the odds of being paid sit right next to the steps. It’s free, with no ads, sponsors or accounts, and it tracks nothing. It gives legal information, not legal advice.',
      ],
    },
    sections: [
      {
        title: 'Five steps, start to finish',
        paras: [
          'How it works walks through a case from asking for the money in writing to filing, serving the papers, the hearing and collecting the judgment. It’s frank about what each step costs in time and money, and a “Before you decide” section covers the options besides court.',
        ],
        media: { kind: 'image', src: fc('steps.webp'), alt: 'How it works: five steps, from asking to getting paid' },
      },
      {
        title: 'Every state’s rules, with sources',
        paras: [
          'Type a ZIP code, city or county, or filter the table of all 50 states and DC. Each state has its own page with the most you can claim, the filing fee, who can appeal and whether lawyers are allowed, every figure linked to the law or the court and dated. Printable checklists bring the same rules to each step.',
        ],
        media: { kind: 'clip', src: fc('states.mp4'), poster: fc('states-poster.webp'), alt: 'Filtering the states table for “new” and opening New York’s rules' },
      },
      {
        title: 'Is it worth it?',
        paras: [
          'The cost calculator asks six questions, one at a time: your state, who’s suing, the amount, what you’d spend, your time and your odds. It then sets what you might get back beside what you’d spend, line by line, and warns you when a claim is over your state’s limit.',
        ],
        media: { kind: 'clip', src: fc('calculator.mp4'), poster: fc('calculator-poster.webp'), alt: 'Answering the cost calculator for a $3,200 California claim and seeing the result' },
      },
      {
        title: 'Ask before you sue',
        paras: [
          'Many disputes end with a clear written request. The demand letter writer builds a calm letter in seven steps, for a deposit, a refund, an unpaid invoice or damage, and adds the state law that applies. The letter updates as you type and downloads as a PDF, prints or copies, all in your browser.',
        ],
        media: { kind: 'clip', src: fc('letter.mp4'), poster: fc('letter-poster.webp'), alt: 'Filling in the demand letter for a security deposit while the letter updates beside it' },
      },
      {
        title: 'California, county by county',
        paras: [
          'California goes deeper: fee tiers by claim size, the 40 official forms by step, deadlines, and a page for each of its 58 counties with courthouses, the free small claims advisor and whether you can file online. A “last day to sue” estimator turns the type of claim and a date into a rough deadline, with the statute behind it.',
        ],
        media: { kind: 'clip', src: fc('deadline.mp4'), poster: fc('deadline-poster.webp'), alt: 'California’s page: a written contract broken on March 15, 2024 gives a last day to sue of about March 15, 2028' },
      },
      {
        title: 'The numbers behind the rules',
        paras: [
          'Charts on the home and About pages show what the checked rules add up to: limits from $2,500 in Kentucky to $25,000 in Delaware and Tennessee, which states raised theirs, who can appeal, and how often winners actually collect. Each chart has its source, its date and a data table.',
        ],
        media: { kind: 'image', src: fc('limits.webp'), alt: 'A map of small claims limits: in 39 of 51 jurisdictions the limit is $10,000 or less' },
      },
    ],
    how: {
      title: 'How Fair Claim works',
      intro:
        'Every rule is researched from primary sources into cited, dated research files. A Python script turns them into the site’s data, and a static website shows them, with a page for every state, California county and checklist. The tools run entirely in your browser.',
      stats: [
        { value: '51', label: 'states and DC, each with its own page' },
        { value: '706', label: 'state rules, each with a source and a date' },
        { value: '58', label: 'California counties, each with its own page' },
        { value: '0', label: 'ads, accounts or trackers' },
      ],
      flows: [
        {
          title: 'The research',
          steps: [
            {
              name: 'Primary sources first',
              text: 'Every limit, fee and deadline comes from the statute, the court rules or the court’s own website, saved with its link and the date it was checked.',
            },
            {
              name: 'Checked again',
              text: 'Two more rounds of checks went back over the facts: 197 values were confirmed and 161 corrected. Rules that are about to change are listed with their dates.',
            },
            {
              name: 'Build the data',
              text: 'A Python script merges the research files into the website’s data, plus a review spreadsheet with a row for every state and California county.',
            },
          ],
        },
        {
          title: 'The tools',
          steps: [
            {
              name: 'One question at a time',
              text: 'The calculator and the letter ask one thing per screen, with your state’s rules filled in for you, and show the result updating as you answer.',
            },
            {
              name: 'Nothing leaves your tab',
              text: 'What you type is never stored or sent. The PDF letter is made in your browser, and each tool opens with a short note that this is information, not advice.',
            },
          ],
        },
        {
          title: 'The website',
          steps: [
            {
              name: 'Static pages',
              text: 'An Astro build writes a page for every state, county, checklist and glossary term. The location search runs in your browser on Census files.',
            },
            {
              name: 'Private by design',
              text: 'Cloudflare Pages serves the site with its own fonts, and there are no analytics, cookies or third-party scripts.',
            },
          ],
        },
      ],
      example: {
        title: 'A worked example: a kept security deposit',
        intro: 'A tenant in California is owed $3,200, thinks they have a 75% chance of winning and a 70% chance of collecting, and would pay $90 up front in fees.',
        sums: [
          {
            terms: [
              { label: 'You can claim', value: '$3,200' },
              { label: 'Fees added if you win', value: '$90' },
            ],
            total: { label: 'Owed if you win', value: '$3,290' },
          },
          {
            terms: [
              { label: 'Owed if you win', value: '$3,290' },
              { label: 'Chance of winning', value: '75%', op: '×' },
              { label: 'Chance of collecting', value: '70%', op: '×' },
            ],
            total: { label: 'Expected back', value: '$1,727' },
          },
        ],
        answer:
          'On those numbers, cases like this bring back about $1,727 on average against $90 spent. Fair Claim calls that “expected recovery exceeds costs”, not a verdict, and a break-even line shows how low the chance of collecting could fall before it stops paying.',
      },
      notes: [
        {
          title: 'Neutral on purpose',
          text: 'The calculator was renamed from “Is it worth it?” to “Small claims cost calculator”, and it shows what the numbers say instead of telling you what to do.',
        },
        {
          title: 'Winning isn’t getting paid',
          text: 'Courts don’t track whether winners collect. In one study of Denver’s small claims court, 55% of winners never collected anything, so collecting gets its own step.',
        },
        {
          title: 'Kept up to date',
          text: 'Each rule shows the date it was checked, and dated changes like Wisconsin’s higher limit in 2027 are on a calendar. California has full county detail; the other states have the statewide rules.',
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
    slug: 'best-bricks',
    name: 'Best Bricks',
    summary:
      'Which LEGO sets are actually worth the money? Best Bricks scores 4,600 sets from 2010 to 2027 out of 100, each against similar sets from its own theme, on how much plastic, pieces and minifigures you get per dollar. Search a set, filter by budget and size, or see which themes give the most for your money.',
    tags: ['Free', 'No sign-up', '4,600 sets'],
    url: 'https://bestbricks.pages.dev/',
    urlLabel: 'Open Best Bricks',
    tagline: 'Which LEGO sets are actually worth the money, scored 0 to 100.',
    thumbs: [bb('home-sm.webp'), bb('set-sm.webp'), bb('themes-sm.webp')],
    hero: { kind: 'image', src: bb('home.webp'), alt: 'The Best Bricks home page: "Which LEGO sets are actually worth the money?" with a set search' },
    why: {
      title: 'Know what a set is really worth',
      paras: [
        'LEGO has always been a hobby of mine. Prices change a lot from set to set and from year to year, and most buyers never see it: a big box or a low price per piece can hide a set that gives you very little for your money.',
        'Best Bricks compares every set only with similar sets, the same theme and a similar size, so a Star Wars set scoring 80 is great value for Star Wars. It shows its working on every page and keeps the builder rating as a separate score, so value and quality never get mixed up.',
      ],
    },
    sections: [
      {
        title: 'Every set, one score',
        paras: [
          'Search any set by name or number and its page leads with a value score out of 100, its rank among similar sets, and a short explanation of why it scored that way. A price check shows what a set with the same contents usually costs.',
        ],
        media: { kind: 'clip', src: bb('search.mp4'), poster: bb('search-poster.webp'), alt: 'Searching for the Venator and opening its page: 76 out of 100, Great value' },
      },
      {
        title: 'See it among similar sets',
        paras: [
          'A chart on every set page places it among the sets it was compared with, by price and value score. Hover any stud to see that set, and the builder rating sits below as its own quality score.',
        ],
        media: { kind: 'clip', src: bb('compare.mp4'), poster: bb('compare-poster.webp'), alt: 'Hovering the chart of 83 large Star Wars sets on the Venator page' },
      },
      {
        title: 'Find the best value for you',
        paras: [
          'Explore filters every rated set by theme, budget, size, verdict and year, can hide motorized sets or show only sets with minifigures, and sorts by value, builder quality, plastic per dollar or price. Every filter is saved in the link.',
        ],
        media: { kind: 'clip', src: bb('explore.mp4'), poster: bb('explore-poster.webp'), alt: 'Filtering Explore to Star Wars sets from $100 to $200 rated Great value' },
      },
      {
        title: 'Theme by theme',
        paras: [
          'Each of the 37 themes has its own page with every set ranked, how many are good value, and how its plastic per dollar and price per piece have moved since 2010.',
        ],
        media: { kind: 'image', src: bb('themes.webp'), alt: 'The Themes page: every theme with its plastic per dollar' },
      },
      {
        title: 'Six questions, six charts',
        paras: [
          'Insights answers what buyers actually ask: which themes give the most plastic, whether licensed sets cost more (12% less plastic per dollar), whether LEGO has got pricier (no, a dollar buys 60% more pieces than in 2010), and the best sets at every budget.',
        ],
        media: { kind: 'image', src: bb('insights.webp'), alt: 'Insights: Minecraft gives the most plastic per dollar, one tower per theme' },
      },
      {
        title: 'Every step shown',
        paras: [
          'How it works walks through the score in six steps with a real set, lists every source, and spells out what is left out and why.',
        ],
        media: { kind: 'image', src: bb('method.webp'), alt: 'How a score is built, step 1: gather every set' },
      },
    ],
    how: {
      title: 'How Best Bricks works',
      intro:
        'A Python pipeline downloads every set’s details and parts list, works out how much you get for the price, and scores each set against similar sets. A static website shows the results, with a page for every set and theme.',
      stats: [
        { value: '4,600', label: 'sets scored, from 37 themes, 2010 to 2027' },
        { value: '97.5%', label: 'of sets measured from their full parts list' },
        { value: '95%', label: 'of price differences explained by the price check' },
        { value: '4,600', label: 'written explanations, one for every set' },
      ],
      flows: [
        {
          title: 'The data',
          steps: [
            {
              name: 'Gather every set',
              text: 'Brickset gives each set’s pieces, minifigures, US price and builder ratings. Gear, books, polybags, promotional items and sets under 25 pieces are left out, 2,548 in all.',
            },
            {
              name: 'Count the plastic',
              text: 'Rebrickable gives every set’s full parts list. From it the pipeline works out how much plastic is in the box, minifigures included and spare parts and packaging left out, and spots sets with motors.',
            },
            {
              name: 'Fair prices across years',
              text: 'Prices are adjusted for inflation to September 2026 dollars with the US consumer price index, from the year LEGO last sold the set at that price, not from its launch.',
            },
          ],
        },
        {
          title: 'The score',
          steps: [
            {
              name: 'Compare with similar sets',
              text: 'Each set is grouped with sets of the same theme and size: under 200, 200 to 499, 500 to 999 or 1,000+ pieces. A set is only ever ranked within its own group.',
            },
            {
              name: 'Measure what you get',
              text: 'Contents per dollar, a mix of plastic and pieces per dollar, counts for 75%; minifigures per $100 counts for 25%. Each minifigure counts as $2 of contents. Display models swap minifigures for how big the finished build is for its price.',
            },
            {
              name: 'Rank, then add up',
              text: 'Beat 90% of the group on contents per dollar and a set earns 90% of those 75 points. 75 and up is Great value, 50 is typical, and under 25 is Poor value.',
            },
            {
              name: 'Quality, kept apart',
              text: 'The Brickset builder rating becomes its own 0 to 100 quality score, steadied with 30 average ratings so a few early votes can’t dominate. It is shown beside the value score and never mixed into it.',
            },
          ],
        },
        {
          title: 'The website',
          steps: [
            {
              name: 'Static pages',
              text: 'An Astro build writes a page for every set and theme, with a share card for each, drawn at build time. Search and Explore run in the browser from small data files.',
            },
            {
              name: 'Edge hosting',
              text: 'Cloudflare Pages serves the site. New scores are a single command: download, re-score, check, then publish.',
            },
          ],
        },
      ],
      example: {
        title: 'A worked example: Double-Decker Sightseeing Bus',
        intro: 'City set 60407, 384 pieces and 5 minifigures for $29.99, ranked against 212 other City sets of 200 to 499 pieces.',
        sums: [
          {
            terms: [
              { label: 'Contents per dollar: 100th percentile × 75%', value: '75' },
              { label: 'Minifigures per $100: 96th percentile × 25%', value: '24' },
            ],
            total: { label: 'Value score', value: '99' },
          },
          {
            terms: [
              { label: 'You pay', value: '$29.99' },
              { label: 'Saved against similar sets', value: '$22.09' },
            ],
            total: { label: 'Similar sets usually cost', value: '$52.08' },
          },
        ],
        answer:
          '99 out of 100, Great value: the best-value City set of its size, and 42% cheaper than its contents usually cost. Its builder quality is scored apart at 79, from a 4.1 rating by 161 Brickset members.',
      },
      notes: [
        {
          title: 'Plastic, not just pieces',
          text: 'Price per piece is easy to game: a set full of tiny pieces looks cheap. Plastic per dollar measures how much material you actually get, shown as an index where 100 is a typical set.',
        },
        {
          title: 'Two methods that agree',
          text: 'The price check is a separate model fitted on every set. Its ranking agrees closely with the value score, at a rank correlation of 0.84.',
        },
        {
          title: 'Honest about its limits',
          text: 'Prices are US list prices, so store discounts aren’t counted yet. Motorized sets are scored but flagged, since motors cost a lot and add little plastic. A resale view is planned next.',
        },
      ],
    },
  },
];
