# @tateru/cli

Interactive CLI that scaffolds a component for your framework, optionally inside a new monorepo.

## Usage

```sh
npx @tateru/cli
```

1. **Framework**: React, Angular, Svelte or Vue.
2. **React** creates an [Nx](https://nx.dev) component library (Vite, Storybook, Vitest, ESLint) and generates the first component with the workspace's own Nx generator:
   - package manager is detected from the project, or asked for;
   - TypeScript or JavaScript is detected from the source files in `packages/` (or, in a new workspace, from `tsconfig.json`, `jsconfig.json` or a `typescript` dependency) and asked for when it can't be determined, e.g. in an empty directory;
   - you choose whether to add Prettier, ESLint, Stylelint, Storybook and unit tests (Vitest and Testing Library); the choice is saved in `tateru.json` so later `create-component` runs only generate matching files (stories, tests, and `format`, `lint`, `lint-style` and `test` targets);
   - existing files are never overwritten, and an existing `package.json` is merged (it becomes `"type": "module"` and its name is scoped, e.g. `@my-app/root`);
   - run it again in the workspace to add more components, or use `npm run create-component -- --name=MyThing`.
3. **Angular, Svelte and Vue** write a barebones component plus a same-named CSS file:
   - inside an existing npm/yarn/pnpm/bun workspace the packages directory is detected;
   - otherwise you choose a new monorepo (package manager and packages directory) or a components directory (`components` by default if it exists, `.` for the root).
4. **Component name**: any case; React uses PascalCase folders, the others kebab-case.

A `package.json` is created if one doesn't exist.

## Development

From the repository root:

```sh
npm install
npm test
node packages/cli/bin/index.js   # run in an empty directory to try it
```

The React workspace supports both languages, so `npm run create-component -- --name=MyThing --language=typescript` also works. Strings live in [src/content.json](src/content.json). The React workspace lives in [templates/react](templates/react): `base/` is always written and `features/<name>/` only when that tool is chosen. Files ending in `.tpl` are rendered with `{{name}}`, `{{scope}}`, `{{rootName}}` and the feature flags, where `{{#flag}}…{{/flag}}` and `{{^flag}}…{{/flag}}` on their own lines keep or drop a block; everything else, including the Nx generator templates, is copied as-is.

Framework-neutral Prettier, Stylelint and Vitest setup files live in
[templates/common/features](templates/common/features). Enabled features copy
framework-specific files first, then common files, without overwriting existing
files. React-specific ESLint rules, Storybook configuration and tests remain in
the React templates.
