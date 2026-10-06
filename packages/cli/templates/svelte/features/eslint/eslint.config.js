import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist/', '**/storybook-static/', '.nx/', '.agents/']),
  {
    files: ['**/*.{js,mjs}'],
    extends: [js.configs.recommended],
  },
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.recommended],
  },
  ...svelte.configs['flat/recommended'],
  {
    files: [
      '*.{js,mjs}',
      'scripts/**/*.js',
      'tools/**/*.js',
      'packages/*/vite.config.mjs',
      'packages/*/.storybook/**/*.mjs',
    ],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['packages/*/src/**/*.{js,ts,svelte}'],
    languageOptions: { globals: globals.browser },
    rules: {
      'no-console': 'error',
    },
  },
  {
    files: ['**/*.test.{js,ts}'],
    languageOptions: { globals: globals.vitest },
  },
]);
