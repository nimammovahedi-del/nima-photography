// @ts-check
import { defineConfig } from 'astro/config';

// The cameras used to live under /about; their pages moved to /photography/cameras.
const cameraSlugs = ['canon-eos-5d-mark-ii', 'canon-eos-7d-mark-ii', 'fujifilm-x-e1'];

export default defineConfig({
  site: 'https://nimamovahedi.com',
  // The Places explorer (the old home page) now lives at /photography; keep old links working.
  redirects: {
    '/places': '/photography',
    '/cities': '/photography',
    ...Object.fromEntries(cameraSlugs.map((s) => [`/about/${s}`, `/photography/cameras/${s}`])),
  },
});
