# Nima Movahedi — Photography

A fast, static photography portfolio built with [Astro](https://astro.build) and hosted on Vercel.

## Run it on your computer

```bash
npm install      # first time only
npm run dev      # open http://localhost:4321 — the page updates as you edit
```

## Add a photo

1. **Drop the image into the right folder** under `src/photos/`:

   | Folder | Tab |
   |---|---|
   | `architecture/` | Architecture |
   | `places/` | Places (street scenes, cityscapes, anything that's mainly "about the place") |
   | `nature/` | Nature |
   | `animals/` | Animals |
   | `film/` | Film |

   Use the full-resolution JPEG. The site makes the small, fast versions (AVIF/WebP, several sizes,
   blurred preview) automatically. Use simple file names like `harbor-dusk.jpg`.

2. **Add an entry to `src/data/photos.yaml`:**

   ```yaml
   # Digital photo, in a sub-tab, tagged with where it was taken
   - file: architecture/barbican.jpg
     title: Barbican Towers
     alt: Concrete balconies of the Barbican estate against a pale sky
     sub: Brutalism
     country: England
     city: London

   # Film photo — add the film simulation name
   - file: film/corner-cafe.jpg
     title: Corner Café
     alt: A small café on a street corner, morning light on the awning
     filmSim: Classic Chrome
     country: Portugal
     city: Lisbon
   ```

   - **sub** puts the photo in a sub-tab (Architecture → Brutalism, Nature → Coast, …). Leave it out and
     the photo only shows under **All**.
   - **country / city** make the photo appear under **Places → that country / city** too, whichever tab
     it lives in. So the Barbican shot above shows in Architecture → Brutalism *and* Places → England →
     London.
   - The **order in this file is the order on the page**.
   - **alt** describes the photo for people using screen readers. Please always fill it in.
   - Camera, lens, aperture, shutter speed and ISO are **read from the photo's EXIF automatically** and
     shown in the lightbox (ⓘ button).
   - A typo in `sub`, `country` or `city`? The build prints a warning telling you which photo.

3. **Remove a photo:** delete the file and its entry.

To replace the placeholders, delete the `placeholder-*.jpg` files and their entries in `photos.yaml`.

## Sub-tabs, countries and cities

All of these live in `src/site.config.ts`:

- **Sub-tabs** — the `subs` list under each tab, e.g. add `'Baroque'` to Architecture. They're always
  shown A–Z.
- **Countries on the globe / Places** — the `places` list. Each country has a `region` (Americas,
  Europe or Africa — the globe's headers) and its cities with real coordinates:

  ```ts
  {
    name: 'Italy', map: 'Italy', region: 'Europe',
    cities: [{ name: 'Rome', lon: 12.50, lat: 41.90 }],
  },
  ```

  Add one and it lights up orange on the globe, appears under its region, gets its own page with an
  animated city map, and slots into the A–Z Places list. To find coordinates, right-click the spot in
  Google Maps — it shows *latitude, longitude*; here they go the other way round (`lon`, then `lat`).
  `map` must match the country's name in the map data (usually just its name; the US is
  `United States of America`).
- **New region?** Add it to `regions` in the same file.

## The home page

The home page is the Places explorer: three stacked region panels (Americas, Europe, Africa). Click
one and it opens out to a full-screen map with its countries labelled; click a country to zoom in to
its city pins. **Pinch or two-finger scroll** (trackpad) zooms; zooming out — or the back button,
Esc, or the browser's Back — steps back a level, and finally returns to the three panels. Links like
`/#europe` open a region directly, and `/places` redirects home. A small A–Z index sits underneath.

The explorer is `src/components/RegionExplorer.astro`; the map engine is `src/scripts/globe.ts`.

## Colours

All colours are defined once at the top of `src/styles/global.css` (the palette: cream, sage,
khaki/tan, lavender, grey-green). Change a value there and it updates everywhere.

## Change text and settings

- `src/site.config.ts` — your name and the short intro used in search results and link previews.

## Publish changes

After the one-time Vercel setup below, every change you push to GitHub goes live in about a minute:

```bash
git add -A
git commit -m "Add new city photos"
git push
```

Want to check it first? Run `npm run build && npm run preview` to see the exact production site locally.

## One-time setup

### Vercel (hosting)
1. Go to [vercel.com](https://vercel.com) → **Sign up with GitHub**.
2. **Add New… → Project** → import `nima-photography`.
3. Vercel detects Astro automatically — just click **Deploy**.
4. Your site is live at `https://<project-name>.vercel.app`. Put that address in `astro.config.mjs`
   (`site:`) so links shared on social media point to the right place.

## Project layout

```
src/
  photos/<category>/    your images
  data/photos.yaml      titles, alt text, sub-tabs, places, film sims
  site.config.ts        name, intro, sub-tabs, regions, countries & cities
  pages/                one file per page (sub-tab and country pages are generated)
  components/           Gallery, Lightbox, Nav, SubTabs, Globe, CountryMap, Illustration
  scripts/globe.ts      the interactive globe (loads when it scrolls into view)
  lib/photos.ts         reads photos, EXIF and blur previews at build time
  lib/world.ts          country outlines for the globe and maps (build time)
  styles/global.css     colours, spacing, film theme
```
