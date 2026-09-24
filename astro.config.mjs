// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Update this once Vercel gives you your final address.
  site: 'https://nima-photography.vercel.app',
  // The Places explorer is the home page; keep old links working.
  redirects: { '/places': '/', '/cities': '/' },
});
