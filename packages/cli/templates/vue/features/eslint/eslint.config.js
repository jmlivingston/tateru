import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
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
  ...vue.configs['flat/recommended'],
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
    files: ['packages/*/src/**/*.{js,ts,vue}'],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { parser: tseslint.parser },
    },
    rules: {
      'no-console': 'error',
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    files: ['**/*.test.{js,ts}'],
    languageOptions: { globals: globals.vitest },
  },
]);
