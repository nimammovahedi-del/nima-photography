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
   - **cover: true** picks the photo shown on that tab's button on the landing page (otherwise the
     first photo is used).
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
- **Countries on the map / Places** — the `places` list. Add a country with its cities and it lights
  up orange on the map, gets its own page, and slots into the A–Z list automatically. `map` must match
  the country's name in the map data (usually just its name; the US is `United States of America`).
- **About / Contact button photos** — `covers`.

## Change text and settings

- `src/site.config.ts` — your name, the landing-page intro, Formspree address, optional public
  email/Instagram link.
- `src/pages/about.astro` — your bio.

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

### Formspree (contact form)
The form already sends to `https://formspree.io/f/mjykrzlz`.
1. Confirm your email address with Formspree (check your inbox after creating the form).
2. Send yourself a test message from the live site — the first submission may ask you to confirm.
3. Optional: in the Formspree dashboard, add your Vercel address under **Settings → Restrict to domain**
   to block spam sent from elsewhere.

## Project layout

```
src/
  photos/<category>/    your images
  data/photos.yaml      titles, alt text, sub-tabs, places, film sims, covers
  site.config.ts        name, intro, sub-tabs, countries & cities, contact
  pages/                one file per page (sub-tab and country pages are generated)
  components/           Gallery (grid), Lightbox, Nav, SubTabs, WorldMap
  lib/photos.ts         reads photos, EXIF and blur previews at build time
  lib/world.ts          draws the world map at build time
  styles/global.css     colours, spacing, film theme
```
