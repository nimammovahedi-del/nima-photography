# Federal Money Atlas — method details (exact figures)

Sources: the live Method page (https://fedmoney.pages.dev/how-it-works/), the repo `~/Projects/federal-money-map` (STATUS.md; `scripts/build_phase0.py`, `config.py`, `aggregate_usaspending.py`, `national_programs.py`, `make_years.py`, `make_site_data.py`) and `output/phase0_counties_fy2023.csv`. Captured 2026-11-05.

## The formula
**Dollars back per $1 = money in ÷ taxes paid**, for each county, federal fiscal year 2023 (Oct 2022–Sep 2023).
- Typical (median) county: **$1.12**. U.S. overall (sum of all money in ÷ sum of all taxes): **$0.73** ($3.14T ÷ $4.32T).
- The U.S. figure is under $1 because Medicare, federal salaries, defense overhead and interest on the debt aren't tied to a county. No deficit adjustment (Rockefeller doesn't adjust either).
- 1,878 of the 3,143 counties with a figure get $1 or more back. Lowest: Dimmit County, TX, −$0.44 (more money was taken back than awarded). Highest: Loving County, TX, $17.04 (46 residents).

## Data sources and years
| Source | Fields used | Year |
|---|---|---|
| USAspending.gov bulk award files (`FY2023_All_Contracts_Full_20261006.zip`, `FY2023_All_Assistance_Full_20261006.zip`, ~3.3 GB zipped) | Every contract, grant, loan and direct-payment transaction: place-of-performance county, recipient location, UEI, assistance listing (CFDA) number, agency, obligation | FY2019–2023 (headline FY2023); file date Oct 6, 2026 |
| IRS Statistics of Income, county data | Income tax, wages, self-employment tax, investment income, refundable credits (codes below) | Tax year 2023 |
| U.S. Treasury Monthly Treasury Statement | National receipts by type: $4.44T total | FY2023 |
| Census Bureau population estimates | County population | Vintage 2025 (2023 values) |
| Census ACS 5-year summary files | Medicaid coverage (C27007), SNAP households (B22001_E002), children under 18 (B09001_E001) | 2019–2023 |
| Census SAIPE | People in poverty | 2023 |
| CMS Medicare Geographic Variation | Medicare spending (shown as "not counted") | 2023 |
| Rockefeller Institute, "Giving or Getting?" (Aug 2025) | State receipts and spending, used only as an outside check | FFY2023 |
| USAspending API (live, in the visitor's browser) | Top 10 recipients, agencies and programs on each county page | FY2023 |

Inputs: **6.69 million contract transactions** and **6.18 million grant, loan and payment transactions** (FY2023).

## Money in (numerator)
Counted: **contracts + grants + Social Security & SSI**, as FY2023 obligations (money committed, not cash paid).
- National totals: **$3.14T** = Social Security & SSI **$1.38T** (44%) + grants **$1.10T** (35%) + contracts **$664.0B** (21%).
- Five years of money in: FY2019 $2.34T · FY2020 $2.65T · FY2021 $3.04T · FY2022 $2.95T · FY2023 $3.14T (2020–21 include pandemic relief; the same rules every year).
- **Attribution: place of performance**, meaning the county where the work happens or the payment is made, not where the company or agency is based. Recipient-location totals are kept in the spreadsheet for comparison. Example of why: by recipient location, 83% of Vermont's 2023 grants ($2.74B of $3.30B) sit in Washington County (Montpelier, the state capital).
- Prime awards only. Sub-awards are part of the prime award, so adding them would count the same money twice.
- Not counted, but kept as separate columns: loans (both face value and the expected cost to the government), Medicare, other direct payments (VA, farm, Pell, housing, SNAP benefits), insurance, and refundable tax credits.
- **Concentration:** 29 counties received half of all contract dollars ($332.0B of $664.0B). The other half was spread across 2,636 counties.

### Nationwide health-benefit contracts set aside
Four nationwide contracts are booked to the county where the contractor's office is. They are moved into an uncounted "national programs booked here" line: veterans' Community Care via Optum and TriWest, and TRICARE via Humana Government Business and Health Net. Together they come to **$35.6B** in FY2023, about $24B of it in Spotsylvania County, VA. Spotsylvania goes from $14.85 back per $1 to **$0.69**. The rule is applied to every year (`national_programs.py --fy=YEAR`).

### Statewide grants shared by need
About three-quarters of grant dollars (mostly Medicaid) go to states with no county attached. Within each state, they are shared among the counties by need, by program number:
| Programs (assistance listing numbers) | Shared by |
|---|---|
| Medicaid 93.778, CHIP 93.767 | People with Medicaid coverage (ACS C27007) |
| School meals 10.555/10.553/10.558/10.559, Title I 84.010, special ed 84.027/84.173, foster care 93.658, adoption 93.659, child support 93.563, Head Start 93.600 | Children under 18 (ACS B09001) |
| TANF 93.558, child care 93.575/93.596, LIHEAP 93.568, CSBG 93.569, SSBG 93.667 | People in poverty (SAIPE 2023) |
| WIC 10.557, SNAP administration 10.561, TEFAP 10.568/10.569 | Households receiving SNAP (ACS B22001) |
| Everything else | Population |

State totals don't change; these amounts are labeled "est." on the site. Statewide Social Security with no county is shared by population. Earlier, in Phase 0, all of this was shared by population; the Phase 1 fixes (sharing by need, plus setting aside the national programs) moved the typical county from $1.09 to $1.12.

## Taxes paid (denominator)
Treasury's FY2023 receipts (**$4.44T** on the site; $4,439B in STATUS.md). **97.3%** is shared out to counties, for **$4.32T** in all:
- **Individual income tax** (~$2,177B), by each county's share of IRS income tax after credits (A06500) plus net investment income tax (A85300). Measured.
- **Payroll taxes** (~$1,615B: Social Security, Medicare, unemployment, railroad), by an estimated payroll base = 12.4% × wages under the Social Security cap + 2.9% × all wages (A00200) + self-employment tax (A09400) + additional Medicare tax (A85530). Wages on returns under $200k AGI are treated as fully under the cap. For returns of $200k and up (IRS bracket agi_stub 8), the average wage per return is capped at a level chosen so that 82.5% of wages nationwide are under the cap.
- **Corporate tax** (~$420B): 75% by investment income (taxable interest A00300 + dividends A00600 + net capital gains A01000, floored at 0) and 25% by wages (same split as Rockefeller).
- **Estate and gift tax**: by investment income. **Excise taxes**: by population.
- **Not shared out (2.7%)**: customs duties and miscellaneous receipts, as Rockefeller does.
- Refundable credits (EITC A59660, ACTC A11070, education A10960) are tracked as "not counted".
- The years differ: taxes are for tax year 2023 (a calendar year), spending is for fiscal year 2023. IRS county data runs about 2.5 years behind.

## Worked example: Franklin County, Ohio (FIPS 39049, Columbus)
Population 1,337,095 (2023).
| Money in | $ |
|---|---|
| Social Security & SSI | 3,867,006,323 → **$3.9B** |
| Grants tagged to the county | 3,025,239,803 |
| Grants: Ohio's statewide grants shared by need (est.) | 3,570,778,281 |
| Grants in all | **$6.6B** (including $3.6B est.) |
| Contracts | 894,445,544 → **$894.4M** |
| **Money in** | **11,357,469,951 → $11.4B** ($8,494 per person) |

| Taxes paid | $ |
|---|---|
| Income tax (measured) | 7,084,881,188 → **$7.1B** |
| Payroll taxes (est.) | 6,406,777,383 → **$6.4B** |
| Corporate tax (est.) | 1,214,500,627 |
| Estate & excise (est.) | 387,927,806 |
| Other taxes (corporate + estate + excise) | **$1.6B** |
| **Taxes paid** | **15,094,087,003 → $15.1B** ($11,289 per person) |

**$11.4B ÷ $15.1B = $0.75** (0.7524) back per $1. That is 1.03× the U.S. overall figure of $0.73 and below the typical county ($1.12). Rank **#2,530** of 3,143 (1 = most back); 67th of 88 in Ohio.
Other figures for Franklin:
- Contracts by recipient location: $6.36B, versus $894M by place of performance. Battelle and other recipients are based there.
- Not counted: Medicare Parts A & B (est.) $2.38B; Medicare as booked in USAspending $2.12B.
- Top live recipients: Ohio Department of Education $1.5B, Battelle $407M, Ohio State University $360M.

## Cross-checks
| Check | Result |
|---|---|
| USAspending contracts total vs. USAspending's published FY2023 total (~$759B, before the national-programs step) | $760.4B ✔ |
| Social Security + SSI in USAspending vs. Treasury benefit outlays | −0.3% ✔ |
| IRS county income tax vs. Treasury income tax receipts | −1.6% (calendar vs. fiscal year) ✔ |
| 50-state tax total vs. Rockefeller's allocated receipts | +0.6%; every state within ±8% ✔ |
| State dollars back vs. Rockefeller's state ratios | correlation **0.965** after the Phase 1 fixes (0.97 in Phase 0) ✔. Ours is lower because we count less spending. |
| Payroll estimate vs. BEA state social-insurance contributions | ~10% lower, as expected (BEA counts by workplace and includes state unemployment insurance) |
| IRS county sums vs. IRS state rows; county populations vs. state totals | exact ✔ |

## Pipeline (scripts/)
1. `fetch_sources.py`: downloads the small public files (~75 MB).
2. `aggregate_usaspending.py [--fy=YEAR]`: downloads the yearly bulk files (~3.3 GB), reads every transaction (~20–40 min), sums by county × category, both by place of performance and by recipient location, puts no-county money into a "statewide" bucket per state, writes `data/interim/usaspending_fy{Y}_by_county.csv`, and deletes the bulk files. It resumes after any failure.
3. `national_programs.py --fy=YEAR`: finds the nationwide VA and TRICARE contracts.
4. `build_phase0.py`: shares out statewide grants by need, shares out taxes, computes ratios and ranks, runs the checks, and writes the spreadsheet (`output/phase0_counties_fy2023.xlsx`, with sheets Read me / Counties (3,144 rows) / States / Checks / Sources) and the CSV.
5. `make_years.py`: builds the FY2019–2023 money-in series with the same rules every year.
6. `make_site_data.py`: writes `site/src/data/counties.json` (used at build time) and `site/public/app/data.js` (~370 KB, used in the browser).
7. Astro 7 static build: **3,152 pages** (8 main pages + 3,144 county pages + 404), ~3,164 files, ~26 MB, built in about 1 second. Cloudflare Pages project "fedmoney" auto-deploys on every push to `main`. Map shapes and chart libraries are self-hosted.
Old county codes are remapped: Connecticut's 8 old counties are split into its 9 planning regions by town population, and Alaska's changed areas are mapped. Kalawao County, HI has no IRS data, so it has no ratio (3,144 counties, 3,143 with a figure).

## Update schedule
Today: rebuilt by hand from the Oct 6, 2026 USAspending files. **Planned:** a monthly automatic refresh (a free GitHub Actions job that rebuilds from USAspending's monthly delta files, pushes, and lets Cloudflare auto-deploy). Also planned: a feed of new awards and cancellations, and congressional districts estimated from counties.

## Non-partisan rules
- No red or blue, no party colors, and no "giver/taker/winner/loser" wording.
- The same method for every county.
- Every ratio is shown next to the U.S. figure and the typical-county figure.
- Estimates are labeled "est."
- Social Security is presented as an earned benefit.
- Free, with no ads and no accounts. Every county's numbers can be downloaded as CSV.
