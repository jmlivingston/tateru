import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    projects: ['packages/*/vite.config.mjs', 'scripts/vitest.config.js'],
  },
});
