# Best Bricks ("Brick Rater") — source notes

Captured 2026-11-06 from the source on Nima's Mac. Read-only; nothing in the app was changed.

- **Source path:** `~/Projects/brick-value-rater`
- **Git remote:** none (local repo only). Latest commit: `5e0c570 2026-11-06 Researched data corrections, D2 logo, link preview cards, rewritten explanations`; 18 commits.
- **Live site:** https://bestbricks.pages.dev (Cloudflare Pages, deployed by hand with `npx wrangler pages deploy dist --project-name bestbricks`). The README's heading still says Vercel, but the steps under it are Cloudflare's.
- **Stack:** Python (pandas/numpy) pipeline in `scripts/` → JSON in `site/src/data/` → static Astro site in `site/` (~2,700+ pages, one per set/theme), 1200x630 OG cards drawn at build time.
- **Data built on:** 2026-11-06 · 4600 rated sets · 2548 excluded · prices in September 2026 dollars · years [2010, 2027]
- **Refresh cadence:** manual — `./update.sh --refresh` on the Mac (needs local BrickLink files), then rebuild + redeploy. No scheduled job. Inflation (BLS CPI) cache auto-refreshes if older than 30 days when the scorer runs.

## README (verbatim)

````markdown
# Best Bricks

Rates how much you get for your money in LEGO sets, by theme. Python scripts download set
data, score every set, and write the data the website in `site/` is built from.

## Project layout

| Folder | What's in it |
|---|---|
| `scripts/` | Downloading, scoring and site-data export (Python) |
| `site/` | The website (Astro). `site/src/data/` holds the generated scores |
| `data/cache/` | Downloaded data: Brickset, Rebrickable, BrickLink, inflation (not committed) |
| `output/` | The scores spreadsheet, for reviewing rankings (not committed) |

## Updating the scores

```bash
./update.sh --refresh
```

This downloads every theme again (about 19 Brickset lookups), re-scores all sets, writes the
spreadsheet to `output/phase0-scores.xlsx` and the site data to `site/src/data/`, and checks
that the site still builds. Leave off `--refresh` to re-score without downloading.

To change which themes or years are rated, or how much each factor counts, edit
`scripts/config.py` and run `./update.sh` again.

## Website

```bash
cd site
npm install
npm run dev
```

The site runs at http://localhost:4321. `npm run build` writes the finished site to
`site/dist/`. Colors, type and spacing all live in `site/src/styles/global.css`, so a
redesign can start there without touching the pages' logic.

### Logo and link previews

The logo is one file, `site/src/assets/logo.svg`. The header, the favicon, the
apple-touch-icon and every link-preview card read it, so a new logo is: replace that file
(keep ink outlines as `#1d1715` and white fills as `#fffaf4` so dark mode can recolour them)
and rebuild. `site/src/assets/logo-small.svg`, if present, is used for the 16px favicon
instead (delete it to use the main logo there too).

`npm run build` first runs `scripts/og-cards.mjs`, which draws a 1200x630 preview card per
set, per theme and per main page into `site/public/og/` (git-ignored). Set photos are
downloaded once from Brickset into `data/cache/og-photos/`; cards are only redrawn when what
they show changes. `npm run og` runs it on its own.

### Deploying (Vercel, same as nima-photography)

The site deploys from GitHub: every push to `main` makes Vercel rebuild it. Vercel only
builds the website; the scoring runs on this computer (it needs the BrickLink files), and
its output in `site/src/data/` is committed.

One-time setup:

1. Sign in to Cloudflare once: `npx wrangler login` (opens the browser).
2. Build and deploy from `site/`:
   `npm run build && npx wrangler pages deploy dist --project-name bestbricks`
3. The site is at https://bestbricks.pages.dev. Repeat step 2 after every data refresh.

After that, publishing new scores is: `./update.sh --refresh`, review, commit
`site/src/data/`, push.

### What's public, and what isn't

- **BrickLink:** its terms forbid passing on data from the site, including the catalog
  download files. Decision (2026-10-30): its part weights are used in calculations only.
  Weights are never published or committed; the site shows plastic per dollar only as an
  index (100 = typical set). `check_public()` in `scripts/site_data.py` refuses to write the
  site data if a set has an unlisted field or anything named like a weight.
- **Brickset:** approved for this use when the API key was requested. The site shows its
  prices, piece counts and ratings, and its set images.
- **Rebrickable:** free to use; the footer credits it.

### Launch checklist

- [ ] Final name and domain (keep "LEGO" out of both)
- [ ] Design pass
- [x] Share images (link previews) for every page, made at build time (see below)
- [ ] Analytics, if wanted (Vercel Web Analytics needs no cookie banner)
- [ ] A way for visitors to send feedback or report a wrong score
- [x] Sitemap, robots.txt, 404 page, canonical links, share previews on set pages
- [x] Data sources cleared (see above)

## Setting up on a new computer

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
npm --prefix site install
```

Then put your Brickset API key in a file called `.env`:

```
BRICKSET_API_KEY=your-key-here
```

`.env` is git-ignored so the key is never uploaded. Don't paste it anywhere else.

Part weights come from two BrickLink catalog files you download by hand (it needs a sign-in
with a LEGO account). Go to bricklink.com/catalogDownload.asp, choose **Catalog Items**, tick
**Include Weight**, pick **Tab-Delimited File**, and download once with **Sets** selected and
once with **Parts**. Put `Sets.txt` and `Parts.txt` in `data/cache/bricklink/`. They aren't
committed; re-download them every few months to pick up new parts. Without them, `score.py`
falls back to the parts-list estimate for every set.

## Data sources

- **Brickset** (brickset.com): pieces, minifigures, US MSRP, ratings, images, and the boxed
  weights the fallback estimate is calibrated on. Keys have a daily limit on set lookups.
- **Rebrickable** (rebrickable.com): every set's parts list, used to work out plastic weight
  and spot motorized sets.
- **BrickLink** (bricklink.com): part weights, used in calculations only (see above).
- **US Bureau of Labor Statistics** (bls.gov): consumer price index, for inflation adjustment.

LEGO is a trademark of the LEGO Group, which does not sponsor, authorize or endorse this project.
````

## scripts/config.py — weights and settings (verbatim, theme map trimmed)

```python
# Brickset subthemes to keep for a theme (themes not listed keep every subtheme).
KEEP_SUBTHEMES = {
    "Creator": ["3 in 1", "3-in-1"],
}

YEARS = range(2010, 2028)

# Sets smaller than this are mostly impulse buys and skew price per piece.
MIN_PIECES = 25

# Personal-use preset: how much each factor counts (they're rescaled to add up to 100%).
# The value score: what you get for the money, ranked against similar sets.
# (Builder ratings are kept out of it and make up the separate quality score.)
VALUE_WEIGHTS = {
    "contents": 75,            # plastic and pieces per dollar, adjusted for set size
    "minifigs_per_100": 25,    # minifigures per $100
}
# Display sets (adult display models) swap minifigures for built size per dollar.
DISPLAY_WEIGHTS = {
    "contents": 75,
    "display_size": 25,        # the finished model's longest side per $100
}
# Each minifigure counts as this many dollars' worth of plastic and pieces, roughly what
# LEGO charges for one beyond its plastic (from the typical-price model).
MINIFIG_CREDIT = 2.0
# Above this many pieces, keep half of the size advantage instead of removing all of it.
SIZE_SOFTEN_FROM = 1000
# Quality: builder ratings pulled toward their class average as if this many extra
# ratings at that average were added, so a handful of early ratings can't dominate.
QUALITY_PRIOR_RATINGS = 30

# A Brickset rating only counts once this many people have rated the set.
MIN_RATINGS = 5

# Sets compare against others in the same theme and size band. If a band has fewer
# than this many sets, it's merged with the neighboring band.
MIN_GROUP_SIZE = 8
SIZE_BANDS = [(0, 199), (200, 499), (500, 999), (1000, 10**6)]  # piece counts
```

## scripts/score.py — method (verbatim excerpts)

```python
"""Score every downloaded set and write output/phase0-scores.xlsx.

Two independent scores, both on US MSRP adjusted for inflation to today's dollars:

  Value score (0-100): how a set ranks against similar sets (same theme and size)
      on price per gram, price per piece, minifigures per $100 and builder rating,
      weighted for someone buying to build and keep. 50 = typical.
  Typical price: what a set with these contents usually costs in its theme, from a
      model fitted on all rated sets. "+20%" means 20% cheaper than typical.

Run scripts/fetch_sets.py first.
"""
...
VERDICTS = [(75, "Great value"), (60, "Good value"), (40, "Average"), (25, "Below average")]
...
    # Contents per dollar: plastic and pieces, with each minifigure credited as
    # MINIFIG_CREDIT dollars' worth of each (at the median rates across all sets)
    grams_per_dollar = (df["weight_g"] / df["price"]).median()
    dollars_per_piece = (df["price"] / df["pieces"]).median()
    credit = df["minifigs"] * config.MINIFIG_CREDIT
    # Without a parts list, estimate plastic from pieces at the theme's typical plastic per piece,
    # so contents per dollar still counts (it then rests on the piece count).
    per_piece = (df["weight_g"] / df["pieces"]).groupby(df["theme"]).transform("median")
    weight = df["weight_g"].fillna(df["pieces"] * per_piece.fillna((df["weight_g"] / df["pieces"]).median()))
    grams = weight + credit * grams_per_dollar
    pieces = df["pieces"] + credit / dollars_per_piece
    df["contents_raw"] = (np.log(grams / df["price"]) + np.log(pieces / df["price"])) / 2
...
def comparison_groups(df):
    """Group sets by theme and size band, merging any band too small to compare fairly
    into its smaller neighbor (so a big set is never ranked against tiny ones)."""
    groups = pd.Series("", index=df.index)
    for theme, sets in df.groupby("theme"):
        bands = [(low, high, sets.index[sets["pieces"].between(low, high)])
                 for low, high in config.SIZE_BANDS]
        bands = [band for band in bands if len(band[2])]
        while len(bands) > 1:
            sizes = [len(band[2]) for band in bands]
            i = sizes.index(min(sizes))
            if sizes[i] >= config.MIN_GROUP_SIZE:
                break
            if i == 0:
                j = 1
            elif i == len(bands) - 1:
                j = i - 1
            else:
                j = i - 1 if sizes[i - 1] <= sizes[i + 1] else i + 1
            a, b = sorted([i, j])
            bands[a] = (bands[a][0], bands[b][1], bands[a][2].union(bands[b][2]))
            del bands[b]
        for low, high, index in bands:
            groups[index] = f"{theme}, {band_label(low, high)}"
    return groups


def percentile(values):
    """0-100 rank among the known values; blank when the group can't tell sets apart."""
    known = values.dropna()
    if len(known) < 3 or known.nunique() < 2:
        return pd.Series(np.nan, index=values.index)
    return (values.rank() - 0.5) / len(known) * 100


def size_adjusted(df):
    """Contents per dollar with each theme's size trend taken out: bigger sets naturally give
    more per dollar, so a set is compared with what's normal for its size. Above
    SIZE_SOFTEN_FROM pieces, half of the advantage is kept, so scale still counts."""
    out = pd.Series(np.nan, index=df.index)
    for _, sets in df.groupby("theme"):
        known = sets["contents_raw"].notna()
        x = np.log(sets["pieces"])
        slope = np.polyfit(x[known], sets.loc[known, "contents_raw"], 1)[0] if known.sum() > 5 else 0
        pivot = np.log(config.SIZE_SOFTEN_FROM)
        effective = np.where(x > pivot, pivot + (x - pivot) / 2, x)
        out[sets.index] = sets["contents_raw"] - slope * effective
    return out


def add_value_score(df):
    """Value: what you get for the money, ranked against similar sets (0-100).
    Builder ratings are not part of it; they make up the separate quality score."""
    df["compared_with"] = comparison_groups(df)
    df["contents"] = size_adjusted(df)
    df["contents_pct"] = df.groupby("compared_with")["contents"].transform(percentile)
    figs = df.groupby("compared_with")["minifigs_per_100"].transform(percentile)
    # Skip minifigures in groups where most sets have none (one figure would count for too much)
    none_share = (df["minifigs"] == 0).where(~df["minifigs_unknown"]).groupby(df["compared_with"]).transform("mean")
    figs[none_share >= 0.75] = np.nan
    figs[df["display"]] = np.nan
    df["minifigs_per_100_pct"] = figs
    # Display sets: is the finished model bigger than typical for a display set at its price?
    # (Size grows more slowly than price, so raw cm per dollar would favour small sets.)
    shown = df["display"] & df["longest_cm"].notna()
    x = np.log(df.loc[shown, "price"])
    y = np.log(df.loc[shown, "longest_cm"])
    slope, intercept = np.polyfit(x, y, 1)
    df["display_size"] = np.nan
    df.loc[shown, "display_size"] = y - (intercept + slope * x)
    df["display_size_pct"] = np.nan
    df.loc[shown, "display_size_pct"] = percentile(df.loc[shown, "display_size"])

    total = pd.Series(0.0, index=df.index)
    used = pd.Series(0.0, index=df.index)
    for metric in ["contents", "minifigs_per_100", "display_size"]:
        weight = np.where(df["display"], config.DISPLAY_WEIGHTS.get(metric, 0),
                          config.VALUE_WEIGHTS.get(metric, 0))
        pct = df[metric + "_pct"]
        known = pct.notna() & (weight > 0)
        total[known] += pct[known] * weight[known]
        used[known] += weight[known]
    df["value_score"] = (total / used).round(0)
    df["verdict"] = df["value_score"].map(verdict)
    # Kept for the site's detail lines
    for metric in ["plastic_per_dollar", "price_per_piece"]:
        pct = df.groupby("compared_with")[metric].transform(percentile)
        df[metric + "_pct"] = 100 - pct if metric in LOWER_IS_BETTER else pct
    return df


def quality_class(row):
    kind = "display" if row["display"] else "build"
    if row["pieces"] < 200:
        size = "small"
    elif row["pieces"] < 1000:
        size = "medium"
    else:
        size = "large"
    return f"{kind}, {size}"


QUALITY_CLASS_LABELS = {
    "display, medium": "display sets of 500–999 pieces",
    "display, large": "display sets of 1,000+ pieces",
    "build, small": "sets under 200 pieces",
    "build, medium": "sets of 200–999 pieces",
    "build, large": "sets of 1,000+ pieces",
}


def add_quality_score(df):
    """Quality: how builders rate the set, compared with sets of the same kind and size from
    every theme (0-100). Each rating is pulled toward its class average as if
    QUALITY_PRIOR_RATINGS extra ratings at that average were added, so a few early ratings
    can't dominate. Kept entirely separate from the value score."""
    raw = df["rating"].where(df["rating_count"] >= config.MIN_RATINGS)
    df["quality_class"] = df.apply(quality_class, axis=1)
    n = df["rating_count"].where(raw.notna(), 0)
    weighted = (raw * n).groupby(df["quality_class"]).transform("sum")
    count = n.groupby(df["quality_class"]).transform("sum")
    class_avg = weighted / count
    k = config.QUALITY_PRIOR_RATINGS
    df["quality_rating"] = (raw * n + class_avg * k) / (n + k)
    df.loc[raw.isna(), "quality_rating"] = np.nan
    df["quality_class_avg"] = class_avg
    df["quality"] = df.groupby("quality_class")["quality_rating"].transform(percentile).round(0)
    return df


def fit_typical_price(df, use_weight):
    """Fit log(price) on pieces, minifigs, theme (and weight); return predictions and fit stats."""
    # The squared term lets price bend with size, so tiny and huge sets aren't predicted
    # from a straight line fitted mostly on mid-size sets.
    columns = (["log_pieces", "log_pieces_sq", "log_minifigs"]
               + (["log_weight"] if use_weight else []))
    themes = sorted(df["theme"].unique())

    def design(rows):
        parts = [np.ones(len(rows))] + [rows[c].to_numpy() for c in columns]
        parts += [(rows["theme"] == t).to_numpy(float) for t in themes[1:]]
        return np.column_stack(parts)

    usable = df[columns].notna().all(axis=1)
    train = df[usable & ~df["motorized"]]
    y = np.log(train["price"].to_numpy())
    # numpy 2.0 on macOS can print false "overflow in matmul" warnings; the results are fine.
    with np.errstate(all="ignore"):
        coef, *_ = np.linalg.lstsq(design(train), y, rcond=None)
        residual = y - design(train) @ coef
        predicted = pd.Series(np.nan, index=df.index)
        predicted[usable] = np.exp(design(df[usable]) @ coef)
    r2 = 1 - (residual ** 2).sum() / ((y - y.mean()) ** 2).sum()
    return predicted, r2, len(train)


def add_typical_price(df):
    df["log_pieces"] = np.log(df["pieces"])
    df["log_pieces_sq"] = df["log_pieces"] ** 2
    df["log_minifigs"] = np.log1p(df["minifigs"])
    df["log_weight"] = np.log(df["weight_g"])
    with_weight, r2_w, n_w = fit_typical_price(df, use_weight=True)
    without_weight, r2_nw, n_nw = fit_typical_price(df, use_weight=False)
    typical_today = with_weight.fillna(without_weight)
    df["vs_typical"] = (typical_today - df["price"]) / typical_today
    df["typical_price"] = typical_today * df["msrp"] / df["price"]  # back to release-year dollars
    return df, {"r2_weight": r2_w, "n_weight": n_w, "r2_no_weight": r2_nw, "n_no_weight": n_nw}


```

## Site meta (site/src/data/meta.json, excluding per-year table)

```json
{
 "builtOn": "2026-11-06",
 "dollarsOf": "September 2026",
 "years": [
  2010,
  2027
 ],
 "ratedCount": 4600,
 "excludedCount": 2548,
 "minPieces": 25,
 "minRatings": 5,
 "minGroupSize": 8,
 "factors": [
  {
   "key": "contents",
   "label": "Contents per dollar",
   "weight": 75
  },
  {
   "key": "minifigs_per_100",
   "label": "Minifigures per $100",
   "weight": 25
  }
 ],
 "displayFactors": [
  {
   "key": "contents",
   "label": "Contents per dollar",
   "weight": 75
  },
  {
   "key": "display_size",
   "label": "Built size per dollar",
   "weight": 25
  }
 ],
 "minifigCredit": 2.0,
 "sizeSoftenFrom": 1000,
 "qualityPrior": 30,
 "displayCount": 488,
 "plasticSource": {
  "fromParts": 0.975,
  "estimated": 0.02,
  "estimateMedianError": 0.119
 },
 "fit": {
  "r2_weight": 0.95,
  "n_weight": 4513,
  "r2_no_weight": 0.92,
  "n_no_weight": 4536
 },
 "agreement": 0.84
}
```

The public "How it works" page text is in `text/about.txt`.
