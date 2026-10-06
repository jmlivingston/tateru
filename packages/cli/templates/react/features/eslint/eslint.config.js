import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist/', '**/storybook-static/', '.nx/', '.agents/']),
  {
    files: ['**/*.{js,jsx,mjs}'],
    extends: [js.configs.recommended],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.recommended],
  },
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
    files: ['packages/*/src/**/*.{js,jsx,ts,tsx}'],
    extends: [react.configs.flat.recommended, react.configs.flat['jsx-runtime'], reactHooks.configs.flat.recommended],
    languageOptions: { globals: globals.browser },
    settings: { react: { version: 'detect' } },
    rules: {
      'no-console': 'error',
      'react/prop-types': 'off',
    },
  },
  {
    files: ['**/*.test.{js,jsx,ts,tsx}'],
    languageOptions: { globals: globals.vitest },
  },
]);
