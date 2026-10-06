# Functionality and combinations

All frameworks generate an Nx workspace with component and shared CSS generators,
publishable library builds, and component styles. Packages live in `packages/`;
build output lives in `dist/packages/`.

## Framework matrix

| Framework | JavaScript | TypeScript | Library build | Storybook                    | Tooling combinations |
| --------- | ---------- | ---------- | ------------- | ---------------------------- | -------------------- |
| React     | Yes        | Yes        | Vite          | Official React integration   | 32                   |
| Angular   | No         | Required   | ng-packagr    | Official Angular integration | 32                   |
| Vue       | Yes        | Yes        | Vite          | Official Vue integration     | 32                   |
| Svelte    | Yes        | Yes        | Vite          | Official Svelte integration  | 32                   |
| Solid     | Yes        | Yes        | Vite          | Not offered                  | 16                   |

**npm, yarn, pnpm and bun** are offered for every supported framework/language pair.
Package-manager support describes CLI options, not an exhaustive installation test matrix.

These choices allow **144 framework/tooling combinations**, or **1,024 configurations**
when supported languages and the four package managers are also counted.
The tooling matrix is covered by template-rendering tests; not every language,
package-manager and tooling configuration has been tested end to end.

::: warning Current limitations
Svelte Storybook builds stories, but automatic prop-documentation generation is
disabled due to an adapter parsing issue. Solid has no official Storybook
integration, so the CLI skips that prompt.
:::

## Optional tools

New workspaces ask about each supported tool, defaulting to Yes. Choices are
saved in `tateru.json` and reused by later component and CSS generator runs.

| Tool       | Adds                                                 | Command              |
| ---------- | ---------------------------------------------------- | -------------------- |
| Prettier   | Formatting configuration and targets                 | `npm run format`     |
| ESLint     | Framework-specific linting configuration and targets | `npm run lint`       |
| Stylelint  | CSS linting configuration and targets                | `npm run lint-style` |
| Storybook  | Stories and a documentation preview                  | `npm start`          |
| Unit tests | Vitest, framework test setup and component tests     | `npm test`           |

Disabled tools omit their generated configuration, scripts and targets. Existing
files and dependencies are preserved when scaffolding into a non-empty directory.

## Complete tooling matrix

**On** means selected; **Off** means omitted. Every row supports Angular, React,
Vue and Svelte with the languages shown above. Solid supports only rows where
Storybook is Off.

| #   | Prettier | ESLint | Stylelint | Storybook | Unit tests | Solid |
| --- | -------- | ------ | --------- | --------- | ---------- | ----- |
| 1   | Off      | Off    | Off       | Off       | Off        | Yes   |
| 2   | Off      | Off    | Off       | Off       | On         | Yes   |
| 3   | Off      | Off    | Off       | On        | Off        | No    |
| 4   | Off      | Off    | Off       | On        | On         | No    |
| 5   | Off      | Off    | On        | Off       | Off        | Yes   |
| 6   | Off      | Off    | On        | Off       | On         | Yes   |
| 7   | Off      | Off    | On        | On        | Off        | No    |
| 8   | Off      | Off    | On        | On        | On         | No    |
| 9   | Off      | On     | Off       | Off       | Off        | Yes   |
| 10  | Off      | On     | Off       | Off       | On         | Yes   |
| 11  | Off      | On     | Off       | On        | Off        | No    |
| 12  | Off      | On     | Off       | On        | On         | No    |
| 13  | Off      | On     | On        | Off       | Off        | Yes   |
| 14  | Off      | On     | On        | Off       | On         | Yes   |
| 15  | Off      | On     | On        | On        | Off        | No    |
| 16  | Off      | On     | On        | On        | On         | No    |
| 17  | On       | Off    | Off       | Off       | Off        | Yes   |
| 18  | On       | Off    | Off       | Off       | On         | Yes   |
| 19  | On       | Off    | Off       | On        | Off        | No    |
| 20  | On       | Off    | Off       | On        | On         | No    |
| 21  | On       | Off    | On        | Off       | Off        | Yes   |
| 22  | On       | Off    | On        | Off       | On         | Yes   |
| 23  | On       | Off    | On        | On        | Off        | No    |
| 24  | On       | Off    | On        | On        | On         | No    |
| 25  | On       | On     | Off       | Off       | Off        | Yes   |
| 26  | On       | On     | Off       | Off       | On         | Yes   |
| 27  | On       | On     | Off       | On        | Off        | No    |
| 28  | On       | On     | Off       | On        | On         | No    |
| 29  | On       | On     | On        | Off       | Off        | Yes   |
| 30  | On       | On     | On        | Off       | On         | Yes   |
| 31  | On       | On     | On        | On        | Off        | No    |
| 32  | On       | On     | On        | On        | On         | No    |

## Existing projects

- Package manager and source language are detected when possible; ambiguous
  language detection prompts again. Angular always uses TypeScript.
- New workspaces merge `package.json`, set ESM mode and use a scoped root name.
  Existing files are kept and reported.
- Existing Nx workspaces must have the tateru generators. A different recorded
  framework is rejected; use a separate directory for a different framework.
- Install or generation failures stop the CLI with an error. An existing
  component folder is rejected rather than overwritten.
