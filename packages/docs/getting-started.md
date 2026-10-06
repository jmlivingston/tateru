# Getting started

Run tateru from an empty project directory:

```sh
npx jmlivingston/tateru
```

Choose your framework, package manager, language and optional tools, then name your first component.
Angular uses TypeScript. Storybook is not offered for Solid.

::: tip
Existing workspaces reuse their tooling choices. Select the same framework;
language is detected when possible.
:::

## Add another component

Run tateru again, or use the generated workspace's Nx generator:

```sh
npm run create-component -- --name=MyComponent --language=typescript
```

Use `--language=javascript` for JavaScript (not available for Angular).

## Add shared CSS

```sh
npm run create-css -- --name=DesignTokens
```

## Build

```sh
npm run build
```

Packages are built into `dist/packages/`. Optional commands such as `npm test`, `npm run lint` and `npm start` are available only when their tools were selected.

See [functionality and combinations](./functionality.md) for the supported frameworks,
languages and optional tools.
