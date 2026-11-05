# Fed Money (Federal Money Atlas) — source notes

Captured 2026-11-05 (read-only; nothing in the repo was changed).

## Where it lives
- **Repo path:** `~/Projects/federal-money-map` (working name "federal-money-map"; public brand "Federal Money Atlas"; final name still open)
- **Git remote:** `https://github.com/nimammovahedi-del/federal-money-atlas.git` — 15 commits, latest `433c353` (2026-11-05 11:53 PT) "Rebalance the text cleanup: restore Method and About…"
- **Live:** https://fedmoney.pages.dev — Cloudflare Pages project `fedmoney`, auto-deploys on push to GitHub `main` (build `npm run build`, output `dist`, NODE_VERSION 24). Unannounced; version 1.0 (assets `?v=1.1.1`).
- **Running log / design doc:** `STATUS.md` (~37 KB) — decisions, sources, method, risks, phase results, next steps.

## Stack
- **Data pipeline:** Python 3 + pandas/openpyxl/pypdf in a local `.venv`, scripts in `scripts/`.
- **Site:** Astro 7 static site (`site/`), `output: "static"`, trailing-slash directory URLs. Only dependency: `astro`.
- **Front end:** plain JS in `site/public/app/` (`core.js`, `pages.js`, `v3.js`, `motion.js`, CSS `base.css`/`v3.css`); data shipped as JS (`data.js` ~370 KB, `years.js` ~140 KB). Map shapes and chart libraries self-hosted in `public/vendor/`. Only external: Google Fonts (Inter, JetBrains Mono) and the USAspending API for the "who got the money" panel.
- Cross-document view transitions; reduced-motion respected.

## Data sources
| Source | Used for |
|---|---|
| USAspending bulk "award data archive" (~3.3 GB/FY zipped; contracts + grants/loans/direct payments) | Main "money in": contracts, grants, Social Security & SSI by county (place of performance) |
| USAspending API (live, client-side) | Top-10 recipients/agencies/programs per county page |
| IRS SOI county data (tax year 2023) | Tax side: income tax, NIIT, SE tax, wages, investment income |
| Treasury Monthly Treasury Statement | National receipts ($4.44T FY2023) & control totals |
| Census population estimates (Vintage 2025), ACS 2019–2023 summary files, SAIPE 2023 | Population; need-based shares for statewide grants |
| CMS Medicare Geographic Variation | "If Medicare were included" column (not counted) |
| BEA CAINC4 | Cross-check of payroll estimates |
| Rockefeller Institute "Giving or Getting?" (Aug 2025) | External check of state totals (correlation ~0.965–0.97) |

## Pipeline
1. `fetch_sources.py` — downloads small public files (~75 MB) to `data/raw/`.
2. `aggregate_usaspending.py [--fy=YEAR]` — downloads the FY bulk files, sums every transaction by county × category, both by place of performance and recipient location; no-county money goes to a per-state "statewide" bucket; writes `data/interim/usaspending_fy{Y}_by_county.csv`; deletes bulk files.
3. `national_programs.py --fy=YEAR` — pulls out nationwide health-benefit contracts (VA Community Care via Optum/TriWest, TRICARE via Humana/Health Net; $35.6B FY2023) booked to one county → uncounted "national programs" line.
4. `build_phase0.py` — allocates taxes to counties and computes dollars back per $1; writes `output/phase0_counties_fy2023.xlsx` (5 sheets: Read me, Counties, States, Checks, Sources) and `.csv`.
5. `make_years.py` — FY2019–2023 money-in series with identical rules → `years.js`.
6. `make_site_data.py` — writes `site/src/data/counties.json` (build-time, one page per county) and `site/public/app/data.js` (browser).
7. `cd site && npm run build` — Astro builds static HTML; Cloudflare Pages deploys on push.
(`make_design_preview.py`, `make_prototype.py` build design explorations in `design/`.)

## Method ("dollars back per $1")
- **Money in** = contracts + grants + Social Security & SSI, FY2023 obligations, by place of performance; prime awards only (no sub-awards). Statewide grants (~¾ of grant dollars, mostly Medicaid) shared by need: Medicaid/CHIP by Medicaid coverage, school/child programs by children, TANF/child care/energy by people in poverty, WIC/SNAP admin by SNAP households, rest by population — labeled "est." Loans, Medicare, other direct payments, refundable credits kept as uncounted columns.
- **Taxes paid**: Treasury FY2023 receipts, 97.3% allocated — income tax by IRS county data (measured); payroll by estimated taxable wages with SS cap; corporate 75% investment income / 25% wages; estate by investment income; excise by population; customs/misc (2.7%) unallocated. Modeled on Rockefeller's state method.
- **Ratio** = money in ÷ taxes paid, always shown beside the U.S. figure. Non-partisan rules: no red/blue, no "giver/taker" wording.
- Fixes: Connecticut planning regions split by town population, old Alaska codes mapped, state names → codes in grant files.

## Key numbers
- 3,144 counties (50 states + DC); 3,143 with a ratio (Kalawao, HI has no IRS data).
- Inputs: 6.69M contract + 6.18M grant/loan/payment transactions (FY2023).
- FY2023 counted money $3.14T (Social Security & SSI $1.38T 44%, grants $1.10T 35%, contracts $664B 21%); taxes allocated $4.32T.
- Typical (median) county $1.12 back per $1; U.S. overall $0.73. 1,878 counties get ≥ $1. 29 counties hold half of all contract dollars.
- Five-year money in: FY2019 $2.34T · 2020 $2.65T · 2021 $3.04T · 2022 $2.95T · 2023 $3.14T.
- Site: 3,152 pages (8 main + 3,144 `/county/{FIPS}/` + 404), ~3,164 files, ~26–27 MB `dist`, builds in ~1 s.
- **Update schedule:** none automated yet. Data is FY2023 (IRS tax year 2023, ~2.5 yrs behind). Planned: monthly refresh via GitHub Actions from USAspending monthly delta files.

## Open items (from STATUS.md)
Error-report channel; search-engine indexing decision; SSA county cross-check; verify 82.5% taxable-wage share; group recipients by parent company; new awards & cancellations feed; monthly auto-refresh; congressional districts; phone map polish (zoom/state view); per-county share images; pre-build "who got the money" lists so the site doesn't depend on the USAspending API.
