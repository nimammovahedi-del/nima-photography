// @ts-check
import { defineConfig } from 'astro/config';

// The cameras used to live under /about; their pages moved to /photography/cameras.
const cameraSlugs = ['canon-eos-5d-mark-ii', 'canon-eos-7d-mark-ii', 'fujifilm-x-e1'];

export default defineConfig({
  site: 'https://nimamovahedi.com',
  // Fetch a page as soon as the pointer rests on (or a finger touches) its link, so the click
  // opens it at once.
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  // The Places explorer (the old home page) now lives at /photography; keep old links working.
  redirects: {
    '/places': '/photography',
    '/cities': '/photography',
    ...Object.fromEntries(cameraSlugs.map((s) => [`/about/${s}`, `/photography/cameras/${s}`])),
  },
});
