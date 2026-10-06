# @tateru/cli

Interactive CLI that scaffolds a component for your framework, optionally inside a new monorepo.

## Usage

```sh
npx @tateru/cli
```

1. **Framework**: React, Angular, Vue, Svelte or Solid.
2. **Workspace**: creates an [Nx](https://nx.dev) component library and generates the first component with the workspace's own Nx generator:
   - package manager is detected from the project, or asked for;
   - Angular uses TypeScript. For other frameworks, TypeScript or JavaScript is detected from the source files in `packages/` (including Vue and Svelte scripts) or project configuration and asked for when it can't be determined;
   - you choose whether to add Prettier, ESLint, Stylelint, Storybook and unit tests (Vitest and Testing Library); the choice is saved in `tateru.json` so later `create-component` runs only generate matching files (stories, tests, and `format`, `lint`, `lint-style` and `test` targets);
   - existing files are never overwritten, and an existing `package.json` is merged (it becomes `"type": "module"` and its name is scoped, e.g. `@my-app/root`);
   - Storybook is offered for React, Angular, Vue and Svelte. Solid does not have an official Storybook integration, so that option is omitted;
   - run it again with the same framework to add more components, or use `npm run create-component -- --name=MyThing`.
3. **Component name**: any case; generated package folders use PascalCase and include a same-named CSS file.

All frameworks now create full workspaces under `packages/`; the earlier standalone
Angular, Vue and Svelte scaffolds are replaced. Use a separate workspace for each framework.

A `package.json` is created if one doesn't exist.

## Development

From the repository root:

```sh
npm install
npm test
node packages/cli/bin/index.js   # run in an empty directory to try it
```

Use `npm run create-component -- --name=MyThing --language=typescript` to generate
TypeScript components, or `--language=javascript` for JavaScript (except Angular).
Strings live in [src/content.json](src/content.json). Each framework lives in
`templates/<framework>`: `base/` is always written and `features/<name>/` only when
that tool is chosen. Files ending in `.tpl` are rendered with `{{name}}`,
`{{scope}}`, `{{rootName}}`, `{{framework}}` and the feature flags.
`{{#flag}}…{{/flag}}` and `{{^flag}}…{{/flag}}` on their own lines keep or drop a
block; everything else, including the Nx generator templates, is copied as-is.

Framework-neutral Prettier, Stylelint and Vitest setup files live in
[templates/common/features](templates/common/features). Enabled features copy
framework-specific files first, then common files, without overwriting existing
files. Framework-specific ESLint rules, Storybook configuration and tests remain
in each framework's templates.
