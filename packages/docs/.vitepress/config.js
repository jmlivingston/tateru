import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitepress';

const content = JSON.parse(readFileSync(new URL('./content.json', import.meta.url), 'utf8'));

export default defineConfig({
  ...content,
  base: '/tateru/',
  cleanUrls: false,
  lastUpdated: true,
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
