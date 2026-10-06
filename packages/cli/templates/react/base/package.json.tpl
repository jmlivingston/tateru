{
  "name": "{{rootName}}",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "generators": "./tools/generators/generators.json",
  "main": "index.js",
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
    "lint-style": "stylelint --fix \"**/*.css\"",
{{#prettier}}
    "format": "nx run-many -t format --projects",
{{/prettier}}
    "clear-cache": "nx reset",
    "create-component": "nx generate {{rootName}}:component",
    "create-css": "nx generate {{rootName}}:css"
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
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "^7.1.1",
    "globals": "^17.12.0",
    "typescript-eslint": "^8.71.1",
{{/eslint}}
{{#storybook}}
    "@nx/storybook": "^23.2.1",
    "@storybook/addon-docs": "^10.6.0",
    "@storybook/react-vite": "^10.6.0",
    "storybook": "^10.6.0",
{{/storybook}}
{{#tests}}
    "@testing-library/dom": "^10.4.2",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.3",
    "@vitest/coverage-v8": "^5.0.1",
    "@vitest/ui": "^5.0.1",
    "jsdom": "^30.1.1",
    "vitest": "^5.0.1",
{{/tests}}
    "@nx/devkit": "^23.2.1",
    "@nx/vite": "^23.2.1",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "@vitejs/plugin-react": "^6.1.1",
    "nx": "^23.2.1",
    "stylelint": "^17.15.0",
    "stylelint-config-standard": "^40.0.0",
    "typescript": "^5.9.3",
    "vite": "^8.3.1"
  },
  "dependencies": {
    "react": "^19.3.0",
    "react-dom": "^19.3.0"
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
