// The research papers, in the order they appear on /research.
// Each paper's own page lives at src/pages/research/<slug>.astro.

export type Institution = 'lse' | 'encode' | 'uci';

export const institutions: Record<Institution, { name: string; logo: string; short: string }> = {
  lse: { name: 'London School of Economics', short: 'LSE', logo: '/research/logos/lse.svg' },
  encode: { name: 'Encode AI, London', short: 'Encode', logo: '/research/logos/encode.svg' },
  uci: { name: 'University of California, Irvine', short: 'UC Irvine', logo: '/research/logos/uci.svg' },
};

export interface Paper {
  slug: string;
  title: string; // short title, used as the headline
  subtitle: string; // the rest of the full title
  summary: string; // 1–2 sentences for the list row
  institution: Institution;
  kind: string; // e.g. "MSc dissertation"
  dept?: string;
  date: string; // as shown, e.g. "August 2026"
  pdf: string;
  readMinutes: number;
}

export const papers: Paper[] = [
  {
    slug: 'judicial-arms-race',
    title: 'The Judicial Arms Race',
    subtitle: 'Courts, Corporations, and Competitive Federalism in the United States',
    summary:
      'When Delaware’s business court unsettled corporate America, Texas and Nevada rebuilt their own courts and laws to win companies over. Three different strategies ended in the same place: less accountability.',
    institution: 'lse',
    kind: 'MSc dissertation',
    dept: 'Department of Government',
    date: 'August 2026',
    pdf: '/research/papers/judicial-arms-race.pdf',
    readMinutes: 5,
  },
  {
    slug: 'iran-power-sharing',
    title: 'Between Fragmentation and Coercion',
    subtitle: 'Accommodative Power-Sharing for Iran’s Ethnic Diversity',
    summary:
      'Iran has held together by suppressing its minorities, and that is failing. Scoring three power-sharing designs against Iran’s ethnic map points to a hybrid built on its 31 provinces.',
    institution: 'lse',
    kind: 'Essay',
    dept: 'Department of Government',
    date: 'May 2026',
    pdf: '/research/papers/iran-power-sharing.pdf',
    readMinutes: 4,
  },
  {
    slug: 'before-the-bench',
    title: 'Before the Bench',
    subtitle: 'Court-Side Solutions Against AI Hallucinations',
    summary:
      'AI tools are inventing case law, and US politics has left courts to cope alone. Three checks courts can adopt today, without waiting for Congress.',
    institution: 'encode',
    kind: 'Policy memo',
    date: '2026',
    pdf: '/research/papers/before-the-bench.pdf',
    readMinutes: 3,
  },
  {
    slug: 'chinese-fdi',
    title: 'Foreign Investment Under Scrutiny',
    subtitle: 'The Role of State-Level Regulations and Political Alignment in Chinese FDI Inflows',
    summary:
      'Across all 50 states from 2010 to 2020, stricter state rules went with less Chinese investment, and Republican-leaning states wrote the stricter rules.',
    institution: 'uci',
    kind: 'Honors thesis',
    dept: 'Department of Political Science',
    date: 'June 2025',
    pdf: '/research/papers/chinese-fdi.pdf',
    readMinutes: 5,
  },
];

export const paperBySlug = (slug: string) => papers.find((p) => p.slug === slug)!;
