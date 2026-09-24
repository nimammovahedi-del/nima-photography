# Nima Movahedi — Photography

A fast, static photography portfolio built with [Astro](https://astro.build) and hosted on Vercel.

## Run it on your computer

```bash
npm install      # first time only
npm run dev      # open http://localhost:4321 — the page updates as you edit
```

## Add a photo

1. **Drop the image into the right folder** under `src/photos/`:

   | Folder | Page |
   |---|---|
   | `architecture/` | Architecture |
   | `cities/` | Cities |
   | `nature/` | Nature |
   | `animals/` | Animals |
   | `film/` | Film |

   Use the full-resolution JPEG. The site makes the small, fast versions (AVIF/WebP, several sizes,
   blurred preview) automatically. Use simple file names like `harbor-dusk.jpg`.

2. **Add an entry to `src/data/photos.yaml`:**

   ```yaml
   # Digital photo
   - file: cities/harbor-dusk.jpg
     title: Harbor at Dusk
     alt: Fishing boats moored under a pink evening sky
     featured: true          # optional — also show it on the home page

   # Film photo — add the film simulation name
   - file: film/corner-cafe.jpg
     title: Corner Café
     alt: A small café on a street corner, morning light on the awning
     filmSim: Classic Chrome
   ```

   - The **order in this file is the order on the page**.
   - **alt** describes the photo for people using screen readers. Please always fill it in.
   - Camera, lens, aperture, shutter speed and ISO are **read from the photo's EXIF automatically** and
     shown in the lightbox (ⓘ button). If you export without metadata, that line is simply hidden.
   - Forgot the entry? The photo still appears, using its file name as the title, and the build prints a
     warning.

3. **Remove a photo:** delete the file and its entry.

To replace the placeholders, delete the `placeholder-*.jpg` files and their entries in `photos.yaml`.

**The home page** shows every photo marked `featured: true`. Keep one or two film shots featured so
visitors discover the Film section. **The Film page** is a single centred column and switches to two
columns on desktop once it has 12+ photos.

## Change text and settings

- `src/site.config.ts` — your name, the home-page intro, Formspree address, optional public
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
  data/photos.yaml      titles, alt text, film sims, featured
  site.config.ts        name, intro, contact settings
  pages/                one file per page
  components/           Gallery (grid), Lightbox, Nav
  lib/photos.ts         reads photos, EXIF and blur previews at build time
  styles/global.css     colours, spacing, film theme
```
