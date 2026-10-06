import js from '@eslint/js';
import solid from 'eslint-plugin-solid/configs/recommended';
import solidTypescript from 'eslint-plugin-solid/configs/typescript';
import tsParser from '@typescript-eslint/parser';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist/', '.nx/', 'coverage/', 'storybook-static/']),
  {
    files: ['**/*.{js,jsx,mjs}'],
    extends: [js.configs.recommended, solid],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.recommended],
    ...solidTypescript,
    languageOptions: { parser: tsParser, globals: globals.browser },
  },
  {
    files: ['*.{js,mjs}', 'scripts/**/*.js', 'tools/**/*.js'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.test.{jsx,tsx}'],
    languageOptions: { globals: globals.vitest },
  },
]);
