import js from '@eslint/js';
import angular from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import templateParser from '@angular-eslint/template-parser';
import tsParser from '@typescript-eslint/parser';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist/', '.angular/', '.nx/', 'coverage/', 'storybook-static/']),
  {
    files: ['**/*.js', '**/*.mjs'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['packages/*/src/**/*.ts'],
    extends: [tseslint.configs.recommended],
    languageOptions: { parser: tsParser, globals: globals.browser },
    plugins: { '@angular-eslint': angular },
    rules: {
      '@angular-eslint/component-class-suffix': 'error',
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'tateru', style: 'kebab-case' }],
      '@angular-eslint/directive-class-suffix': 'error',
      '@angular-eslint/no-empty-lifecycle-method': 'error',
      '@angular-eslint/prefer-inject': 'error',
      '@angular-eslint/prefer-standalone': 'error',
      '@angular-eslint/use-component-selector': 'error',
    },
  },
  {
    files: ['packages/*/src/**/*.html'],
    languageOptions: { parser: templateParser },
    plugins: { '@angular-eslint/template': angularTemplate },
    rules: {
      '@angular-eslint/template/alt-text': 'error',
      '@angular-eslint/template/button-has-type': 'error',
      '@angular-eslint/template/click-events-have-key-events': 'error',
      '@angular-eslint/template/interactive-supports-focus': 'error',
      '@angular-eslint/template/no-positive-tabindex': 'error',
      '@angular-eslint/template/valid-aria': 'error',
    },
  },
  {
    files: ['**/*.spec.ts'],
    languageOptions: { globals: globals.vitest },
  },
]);
