{
  "name": "{{rootName}}",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "workspaces": ["packages/*"],
  "generators": "./tools/generators/generators.json",
  "scripts": {
{{#storybook}}
    "start": "nx run {{name}}:storybook",
    "build-storybook": "nx run {{name}}:build-storybook",
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
    "@angular-eslint/eslint-plugin": "^22.5.0",
    "@angular-eslint/eslint-plugin-template": "^22.5.0",
    "@angular-eslint/template-parser": "^22.5.0",
    "@eslint/js": "^9.39.5",
    "@typescript-eslint/parser": "^8.71.1",
    "eslint": "^9.39.5",
    "globals": "^17.12.0",
    "typescript-eslint": "^8.71.1",
{{/eslint}}
{{#stylelint}}
    "stylelint": "^17.15.0",
    "stylelint-config-standard": "^40.0.0",
{{/stylelint}}
{{#storybook}}
    "@angular-devkit/build-angular": "^22.2.1",
    "@angular/cli": "^22.2.1",
    "@storybook/addon-docs": "^10.6.1",
    "@storybook/angular": "^10.6.1",
    "storybook": "^10.6.1",
{{/storybook}}
{{#tests}}
    "@analogjs/vite-plugin-angular": "^2.8.0",
    "@analogjs/vitest-angular": "^2.8.0",
    "@angular-devkit/architect": "^0.2202.1",
    "@angular/build": "^22.2.1",
    "@oxc-project/runtime": "^0.121.0",
    "@vitest/coverage-v8": "^5.0.1",
    "@vitest/ui": "^5.0.1",
    "jsdom": "^30.1.1",
    "vitest": "^5.0.1",
{{/tests}}
    "@nx/devkit": "^23.2.1",
    "ng-packagr": "^22.2.4",
    "nx": "^23.2.1",
    "typescript": "~6.0.0"
  },
  "dependencies": {
    "@angular/common": "^22.2.1",
    "@angular/compiler": "^22.2.1",
    "@angular/core": "^22.2.1",
    "@angular/platform-browser": "^22.2.1",
{{#storybook}}
    "@angular/animations": "^22.2.1",
    "@angular/platform-browser-dynamic": "^22.2.1",
{{/storybook}}
    "rxjs": "^7.8.2",
    "tslib": "^2.8.1",
    "zone.js": "^0.16.0"
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
