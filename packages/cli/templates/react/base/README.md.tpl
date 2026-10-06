# {{name}}

React component library built with Nx and Vite. Each component in `packages/` is its own publishable package.

## Commands

```sh
npm install
{{#storybook}}
npm start                                   # Storybook on http://localhost:4000
{{/storybook}}
npm run create-component -- --name=MyThing  # new component package (PascalCase), JavaScript or TypeScript
npm run create-css -- --name=DesignTokens   # new shared CSS package
{{#tests}}
npm test
{{/tests}}
npm run build                               # output in dist/packages
{{#eslint}}
npm run lint
{{/eslint}}
{{#stylelint}}
npm run lint-style
{{/stylelint}}
{{#prettier}}
npm run format
{{/prettier}}
```

## Structure

```
packages/<Name>/   component packages
scripts/           shared Vite configuration
tools/generators/  Nx generators behind create-component and create-css
tateru.json        optional tooling chosen when the workspace was created
```

Packages are discovered from `packages/`, so new components need no extra wiring. To publish one, run `npm publish` inside `dist/packages/<Name>`.

`tateru.json` records which of Prettier, ESLint, Stylelint, Storybook and unit tests this workspace uses, so the generators only create matching files.
