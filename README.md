# tateru

Nx workspace for the tateru tools.

Generate React, Angular, Vue, Svelte or Solid component libraries:

```sh
npx jmlivingston/tateru
```

Run in an empty project directory to create a workspace, or in an existing
tateru workspace to add a component. Angular requires TypeScript; other frameworks
support JavaScript or TypeScript. Storybook is offered for all except Solid.

## CLI workflow

```mermaid
flowchart TD
  Start["Run tateru in the target directory"] --> Detect["Detect workspace and package manager"]
  Detect --> Framework["Choose framework"]
  Framework --> Valid{"Existing Nx workspace has generators<br/>and framework matches?"}
  Valid -- "No" --> Error["Report error and stop"]
  Valid -- "Yes, or no existing Nx workspace" --> Manager{"Package manager detected?"}
  Manager -- "No" --> ChooseManager["Choose npm, yarn, pnpm or bun"]
  Manager -- "Yes" --> Angular{"Angular?"}
  ChooseManager --> Angular
  Angular -- "Yes" --> TS["Use TypeScript"]
  Angular -- "No" --> Language{"Source language detected?"}
  Language -- "No or ambiguous" --> ChooseLanguage["Choose TypeScript or JavaScript"]
  Language -- "Yes" --> Existing{"Existing Nx workspace?"}
  TS --> Existing
  ChooseLanguage --> Existing
  Existing -- "Yes" --> Reuse["Reuse saved tooling choices"]
  Existing -- "No" --> Tools["Choose Prettier, ESLint, Stylelint and unit tests"]
  Tools --> Solid{"Solid?"}
  Solid -- "No" --> Storybook["Choose whether to add Storybook"]
  Solid -- "Yes" --> Name["Enter and validate component name"]
  Storybook --> Name
  Reuse --> Name
  Name --> New{"New workspace?"}
  New -- "Yes" --> Scaffold["Merge package.json, copy templates<br/>and save framework and tooling choices"]
  New -- "No" --> InstallNeeded{"Nx installation missing?"}
  Scaffold --> Install["Install dependencies"]
  InstallNeeded -- "Yes" --> Install
  InstallNeeded -- "No" --> Generate["Run the local Nx component generator"]
  Install --> Installed{"Installation succeeded?"}
  Installed -- "No" --> Error
  Installed -- "Yes" --> Generate
  Generate --> Generated{"Generation succeeded?"}
  Generated -- "No" --> Error
  Generated -- "Yes" --> Done["Component ready in packages/Name"]
```

Cancelling any prompt exits without generating files. Existing component folders
are rejected. New workspaces preserve existing files but merge `package.json`,
switch it to ESM and scope its name when needed.

See the [functionality and combination matrix](packages/docs/functionality.md)
for the supported options and current limitations.

| Package                       | Description                                    |
| ----------------------------- | ---------------------------------------------- |
| [@tateru/cli](packages/cli)   | Interactive component and workspace scaffolder |
| [@tateru/docs](packages/docs) | Static VitePress documentation                 |

```sh
npm install
npx nx run-many -t test
```

## Code quality

```sh
npm run lint
npm run format
npm run format:check
npm test
```

`npm install` enables Husky hooks. Pre-commit checks lint, formatting and tests
without modifying or staging files. Checkout, merge and rebase hooks run
`npm ci` when the root lockfile changes. Tests use Node's built-in test runner.
Generator templates are excluded from root linting and formatting.

## Documentation

```sh
npm run docs
npx nx run @tateru/docs:build
npx nx run @tateru/docs:preview
```

Markdown content lives in `packages/docs`. Navigation is configured in
`packages/docs/.vitepress/content.json`.

Local development and preview use http://localhost:3000/tateru/.
If port 3000 is occupied, the server reports an error rather than switching ports.

In GitHub **Settings > Pages**, select **GitHub Actions** as the source.
The documentation workflow builds pull requests and deploys pushes to `main`
to https://jmlivingston.github.io/tateru/. It can also be run manually.

Before building, CI writes formatting changes and runs lint and tests. If these
checks pass, it commits and pushes formatting changes to the source branch.
Any failure blocks building and publishing. Branch protection must permit the
workflow's push; fork pull requests must commit formatting changes locally.
Pushes made with `GITHUB_TOKEN` do not trigger another workflow run.

To pause publishing, set `DOCS_PUBLISH_ENABLED` to `'false'` in
`.github/workflows/docs.yml`. Builds still run; set it back to `'true'` to resume.
