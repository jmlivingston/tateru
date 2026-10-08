import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitepress';

const content = JSON.parse(readFileSync(new URL('./content.json', import.meta.url), 'utf8'));
const base = '/tateru/';

export default defineConfig({
  ...content,
  base,
  cleanUrls: false,
  lastUpdated: true,
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}favicon.svg` }]],
  vite: {
    server: {
      port: 3000,
      strictPort: true,
    },
    preview: {
      port: 3000,
      strictPort: true,
    },
  },
});
