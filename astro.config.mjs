// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';

const siteUrl = 'https://vashanth.github.io';

function getPhotoImages() {
  const publicDir = path.join(process.cwd(), 'public');
  const files = fs.readdirSync(publicDir);
  return files
    .filter(file => file.startsWith('vashanth_') && /\.(jpeg|jpg|png|gif|webp)$/i.test(file))
    .sort()
    .map(file => ({ url: `${siteUrl}/${file}` }));
}

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  integrations: [
    sitemap({
      serialize(item) {
        if (item.url === `${siteUrl}/photos/`) {
          return {
            ...item,
            img: getPhotoImages(),
          };
        }
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  },
  output: 'static',
  build: {
    format: 'directory'
  }
});