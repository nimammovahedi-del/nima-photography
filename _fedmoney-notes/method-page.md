# Method · Federal Money Atlas

Source: https://fedmoney.pages.dev/how-it-works/ (rendered 2026-11-05T20:08:18.642Z)

METHOD

How the numbers are calculated

One division, done the same way for every county. Here is each step, where the data comes from, what is estimated, and how we checked it.

$
%
MONEY IN
$3.14T
÷
TAXES PAID
$4.32T
=
BACK PER $1 · U.S.
$0.73

1

Money in

Every federal contract, grant and Social Security & SSI payment committed in fiscal year 2023 (Oct 2022–Sep 2023), credited to the county where the work or payment happens — not where the company or agency is based. We count the main award only, never the sub-awards inside it, so nothing is counted twice.

About three-quarters of grant dollars (mostly Medicaid) go to states with no county attached. Each county gets a share based on the people each program serves: Medicaid by residents with Medicaid coverage, school and child programs by children, TANF and child care by people in poverty, food programs by households on SNAP, the rest by population (Census Bureau). These are marked “est.”

Four nationwide health-benefit contracts — veterans' community care and TRICARE, $35.6B in all — are booked to the contractor's office county. They're shown separately as “national programs” and not counted for that county.

2

Taxes paid

We start from the U.S. Treasury's fiscal 2023 total ($4.44 trillion) and share 97% of it out to counties:

Income tax — by each county's share in IRS county data (measured).
Payroll taxes — by an estimate of each county's taxable wages, with the Social Security wage cap applied.
Corporate tax — 75% by investment income, 25% by wages.
Estate tax by investment income; excise taxes by population.
Customs and other receipts (2.7%) aren't assigned to any county.

3

Divide

Money in ÷ taxes paid = dollars back per $1. We compare each county with the typical county ($1.12), the one in the middle. The U.S. overall figure ($0.73) adds everything up, so a few high-tax places weigh heavily on it.

It is under $1 nationally because Medicare, federal salaries, defense overhead and interest on the debt aren't tied to a county here.

WORKED EXAMPLE

Franklin County, Ohio
SOCIAL SECURITY & SSI
$3.9B
+
GRANTS (INCL. $3.6B EST.)
$6.6B
+
CONTRACTS
$894.4M
=
MONEY IN
$11.4B
INCOME TAX
$7.1B
+
PAYROLL (EST.)
$6.4B
+
OTHER (EST.)
$1.6B
=
TAXES PAID
$15.1B

$11.4B ÷ $15.1B = $0.75 back for every $1.

SOURCES

Every number comes from public data
USAspending.gov bulk award files
U.S. Treasury
Every federal contract, grant, loan and direct payment, with the county where the work or payment happens
FY2019–2023
IRS Statistics of Income, county data
IRS
Income tax, wages, self-employment tax and investment income by county
Tax year 2023
Monthly Treasury Statement
U.S. Treasury
National tax totals by type; Social Security and SSI payments (for checks)
FY2023
County population estimates
Census Bureau
Residents per county (July 1, 2023)
2023
Medicare Geographic Variation
CMS
Medicare spending by county (shown for context, not counted)
2023
“Giving or Getting?” (2025)
Rockefeller Institute
State-level estimates used to check our totals
FFY2023

HOW WE CHECKED IT

±0.3%
Social Security & SSI in our data vs. Treasury's payments
$760B
Contracts, matching USAspending's published FY2023 total
±8%
Every state's taxes vs. the Rockefeller Institute's estimates (0.6% overall)
0.97
Correlation of our state results with Rockefeller's

LIMITS TO KEEP IN MIND

Money is what agencies committed that year; large contracts can land in one year for several years of work.
Statewide grants are shared by the people each program serves, measured by the Census Bureau — an estimate, not actual payments per county.
Other nationally run contracts may still be booked at one office; counties where contracts dominate are flagged.
Taxes other than income tax are estimates. Connecticut reports 9 planning regions instead of counties.

DATA VERSION

Version 1.0

USAspending bulk files of Oct 6, 2026 (FY2023); IRS SOI county data, tax year 2023; Census Vintage 2025 and ACS 2019–2023; Treasury MTS FY2023. Agencies correct past spending every month, so each release keeps its version number and date; cite the version you used.

3,144 counties and county-equivalents; 3,143 have a dollars-back figure (Kalawao, HI is reported by the IRS together with Maui).

CHANGES

0.5
Statewide grants shared by need (Medicaid coverage, children, poverty, SNAP); nationwide health-benefit contracts moved to their own line · Nov 5, 2026
0.4
Who got the money (live from USAspending), citations, footer, phone layout · Nov 5, 2026
0.3
Analytics page, method page, map filters by population and dollars back · Nov 5, 2026
0.2
Plain notes for outlier counties; one number format; search by state · Nov 4, 2026
0.1
First county totals and checks against Treasury and the Rockefeller Institute · Nov 4, 2026
