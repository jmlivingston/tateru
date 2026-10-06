{
  "name": "{{rootName}}",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "generators": "./tools/generators/generators.json",
  "scripts": {
{{#storybook}}
    "start": "nx run storybook:start --",
{{/storybook}}
    "build": "nx run-many -t build --projects",
{{#tests}}
    "test": "nx run-many -t test --projects",
{{/tests}}
{{#eslint}}
    "lint": "nx run-many -t lint --projects",
{{/eslint}}
{{#stylelint}}
    "lint-style": "stylelint --fix \"**/*.css\"",
{{/stylelint}}
{{#prettier}}
    "format": "nx run-many -t format --projects",
{{/prettier}}
    "clear-cache": "nx reset",
    "create-component": "nx generate ./tools/generators/generators.json:component",
    "create-css": "nx generate ./tools/generators/generators.json:css"
  },
  "keywords": [],
  "license": "MIT",
  "description": "",
  "devDependencies": {
{{#prettier}}
    "prettier": "^3.9.9",
{{/prettier}}
{{#eslint}}
    "@eslint/js": "^9.39.5",
    "eslint": "^9.39.5",
    "eslint-plugin-vue": "^10.11.1",
    "globals": "^17.12.0",
    "typescript-eslint": "^8.71.1",
    "vue-eslint-parser": "^10.3.0",
{{/eslint}}
{{#stylelint}}
    "stylelint": "^17.15.0",
    "stylelint-config-standard": "^40.0.0",
{{/stylelint}}
{{#storybook}}
    "@nx/web": "^23.2.1",
    "@nx/storybook": "^23.2.1",
    "@storybook/addon-docs": "^10.6.1",
    "@storybook/vue3-vite": "^10.6.1",
    "storybook": "^10.6.1",
{{/storybook}}
{{#tests}}
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/vue": "^8.1.0",
    "@vitest/coverage-v8": "^5.0.3",
    "@vitest/ui": "^5.0.3",
    "jsdom": "^30.1.1",
    "vitest": "^5.0.3",
{{/tests}}
    "@nx/devkit": "^23.2.1",
    "@nx/vite": "^23.2.1",
    "@vitejs/plugin-vue": "^6.0.9",
    "nx": "^23.2.1",
    "typescript": "^5.9.3",
    "vite": "^8.3.1",
    "vue-tsc": "^3.3.12"
  },
  "dependencies": {
    "vue": "^3.5.43"
  },
  "allowScripts": {
    "@parcel/watcher": false,
    "esbuild": false,
    "fsevents": false,
    "nx": false
  },
  "nx": {
    "includedScripts": []
  }
}
