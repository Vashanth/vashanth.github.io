// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://vashanth.github.io',
  // Uncomment if deploying to a subpath: base: '/portfolio',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()]
  },
  output: 'static',
  build: {
    format: 'directory'
  }
});