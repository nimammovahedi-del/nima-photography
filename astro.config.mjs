// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Update this once Vercel gives you your final address.
  site: 'https://nima-photography.vercel.app',
  // "Cities" became "Places" — keep old links working.
  redirects: { '/cities': '/places' },
});
