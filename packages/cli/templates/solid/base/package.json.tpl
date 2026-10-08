{
  "name": "{{rootName}}",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "workspaces": ["packages/*"],
  "generators": "./tools/generators/generators.json",
  "scripts": {
{{#storybook}}
    "start": "nx run storybook:start --",
{{/storybook}}
    "build": "nx run-many -t build",
{{#tests}}
    "test": "nx run-many -t test",
{{/tests}}
{{#eslint}}
    "lint": "nx run-many -t lint",
{{/eslint}}
{{#stylelint}}
    "lint-style": "stylelint --fix \"**/*.css\"",
{{/stylelint}}
{{#prettier}}
    "format": "nx run-many -t format",
{{/prettier}}
    "clear-cache": "nx reset",
    "create-component": "nx generate ./tools/generators/generators.json:component",
    "create-css": "nx generate ./tools/generators/generators.json:css"
  },
  "license": "MIT",
  "devDependencies": {
{{#prettier}}
    "prettier": "^3.9.9",
{{/prettier}}
{{#eslint}}
    "@eslint/js": "^9.39.5",
    "@typescript-eslint/parser": "^8.71.1",
    "eslint": "^9.39.5",
    "eslint-plugin-solid": "^0.18.1",
    "globals": "^17.12.0",
    "typescript-eslint": "^8.71.1",
{{/eslint}}
{{#stylelint}}
    "stylelint": "^17.15.0",
    "stylelint-config-standard": "^40.0.0",
{{/stylelint}}
{{#storybook}}
    "@nx/storybook": "^23.2.1",
    "@storybook/addon-docs": "^10.6.0",
    "storybook": "^10.6.0",
    "storybook-solidjs-vite": "^10.7.2",
{{/storybook}}
{{#tests}}
    "@solidjs/router": "^1.0.0",
    "@solidjs/testing-library": "^0.8.10",
    "@testing-library/dom": "^10.4.2",
    "@testing-library/jest-dom": "^6.9.1",
    "@vitest/coverage-v8": "^5.0.1",
    "@vitest/ui": "^5.0.1",
    "jsdom": "^30.1.1",
    "vitest": "^5.0.1",
{{/tests}}
    "@nx/devkit": "^23.2.1",
    "nx": "^23.2.1",
    "typescript": "~6.0.0",
    "vite": "^8.3.1",
    "vite-plugin-solid": "^2.11.14"
  },
  "dependencies": {
    "solid-js": "^1.9.16"
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
