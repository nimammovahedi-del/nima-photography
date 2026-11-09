# Fair Claim — source notes

Captured 2026-11-09 from the live site and the local source on Nima's Mac. Read-only; nothing in the repo or site was changed.

- **Live site:** https://fairclaim.pages.dev (Cloudflare Pages project `fairclaim`, fedmoney account; auto-deploys on every push). Every page is `noindex` and robots.txt blocks crawlers.
- **Source:** github.com/nimammovahedi-del/fair-claim (private); local clone `~/Projects/small-claims`. Latest commit `24964dc 2026-11-08 Remove unverified badges, notes, research notes and hedge phrases from the site (display only; research files keep the flags)`; 26 commits.
- **Stack:** research JSON (`research/`, cited and dated) → `scripts/build_tables.py` → site data + review spreadsheet → static Astro site in `site/`. Framework-free logic in `site/src/lib/core/` (deadlines, demand letter, worth-it math). PDF made in the browser with jsPDF. Location search runs in the browser on Census files in `site/public/geo/`. No AI API, no analytics, self-hosted fonts.
- **Tagline:** "Small claims, explained." Meta description: "Free, neutral information about small claims court: cited, dated rules for every state, the costs, and what happens after a judgment. Legal information, not legal advice."

## Tools on /tools/
| | Tool | Tile text | Notes |
|---|---|---|---|
| A | Cost calculator (`/worth-it/`) | "What you'd spend, side by side with what you might get back." · SIX QUESTIONS | One question at a time: state, who's suing, amount, up-front costs, your time, the odds (win % and collect %). Result: "What the numbers show" with expected back vs total costs and a line-by-line breakdown. Warns when over the limit; sets California's fee from the amount. |
| B | Demand letter (`/demand-letter/`) | "A calm letter asking to be paid. Copy, print or save as PDF." · SEVEN STEPS | Kinds: security deposit, refund, unpaid invoice, property damage, something else. Optional state adds cited law notes (e.g. CA Civ. Code § 1950.5). Live letter preview; Download PDF / Print / Copy text. |
| C | Checklists (`/checklists/`) | "Printable lists for each step, with your state's rules." · ONE PER STATE | `/checklists/{state}/`, folded sections open when printing. |

Also interactive (not on /tools/): the California **"last day to sue" estimator** on `/states/ca/` (Deadlines tab; claim type + date → estimated date with statute cite, e.g. Written contract, 2024-03-15 → "About March 15, 2028, 492 days from today", CCP 337(a)); the **states table filter** and **location search** (ZIP, city, county or state) on `/states/`, home and `/checklists/`; the CA counties filter.

Every tool shows a one-time **"Before you start"** notice (stored in localStorage `fc-notice-v1:<id>`): legal information not advice; nothing typed is stored or sent; estimates come from cited sources; check with the court, a free advisor or legal aid.

Theme: header switch Light / Dark / Auto, stored as localStorage `fc-theme`.

## Numbers the site shows (2026-11-09)
- **51 jurisdictions** (50 states + DC), each with a state page; rules "checked 2026-11-05".
- **58 California counties**, each with a county page; 44 of 58 take filings online.
- **706 state facts** (each with a source and date); **406 California county facts**; **161 values corrected and 197 confirmed** in two re-check rounds (About page, counted from data files).
- **41 glossary terms**, 30 California notes.
- **40 official California forms** (Forms tab on /states/ca/).
- Limits range **$2,500 to $25,000**; in 39 of 51 jurisdictions the limit is $10,000 or less. California: $12,500 individuals / $6,250 businesses.
- **10 states** raised their limit since January 2020 (About chart); **5 dated changes** on the calendar ("Rules changing soon": GA $15,000→$25,000 Jan 2027, RI fee $75.75→$75 Jan 2027, SC fee, WI limit, UT 2030).
- Either side can appeal in 40 of 51 jurisdictions.
- Getting paid: Denver study (Fordham Urb. L.J. 1994) — **55%** of winners never collected anything; 85% of plaintiffs who came to the hearing won; 31% of awarded money was paid. Pew Philadelphia: 95% of judgments were defaults.
- Charts (home + About): US limit tile map, limit changes, appeals/lawyer rules, collection odds, Philadelphia outcomes — each with source, date and data table.

## README (verbatim)
```markdown
# Fair Claim (working name)

A free small claims court guide: should you sue, the five steps, and the honest odds of getting paid.
Every rule is cited and dated. Legal information, not legal advice.

See **STATUS.md** for where things stand.
```

## STATUS.md key points (condensed)
- Phase 0 finished 2026-11-06; live at fairclaim.pages.dev since 2026-11-07, still noindex (go public later with `PUBLIC_INDEXABLE=true`).
- Decisions (2026-11-05): calm, candid, neutral voice; main readers are tenants (deposits), consumers vs businesses, small businesses/freelancers; basic rules for all 50 states + DC, full county detail for California; "I've been sued" comes later.
- Round 2: original design system (inspired by, but copying nothing from, the French government DSFR); one-time "Before you start" notices; "Is it worth it?" renamed to the neutral "Small claims cost calculator"; charts not visitor analytics; glossary of 41 terms; printable checklists per state.
- Round 3 (2026-11-07): rebuilt in "Option A" design — tomato, cobalt, lilac, sage, sand palette; Inter Tight + Geist; one-question-at-a-time flows. Verification rounds 2 and 3 confirmed/corrected hundreds of facts (e.g. Ohio and Mississippi appeal deadlines are 30 days).
- Round 6: location search (Census ZCTA/Gazetteer data, in-browser), "Balance" logo (scale with cobalt and tomato tiles), shorter home page, four-part About.
- UX pass (2026-11-08): compact phone layouts (/states/ −62% height, calculator −51%); unverified badges removed from display (research files keep the flags: 12 state and 42 county details still open).

## About page — key text
- "Small claims court, by the numbers we can source." / "It can settle a money dispute without a lawyer. It can also cost more than it returns, and winning doesn't mean being paid."
- Four parts: 01 Winning isn't getting paid · 02 Who uses small claims · 03 How we check facts ("Primary sources first, and a date on everything.") · 04 Why this site exists ("Information about small claims court that isn't trying to talk you into anything." — free, no ads, sponsors, accounts or tracking).
- Footer: "Free, neutral information about small claims court in all 50 states and DC." · "INDEPENDENT · NOT A COURT, AGENCY OR LAW FIRM".
