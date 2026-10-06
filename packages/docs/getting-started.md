# Getting started

Run tateru from an empty project directory:

```sh
npx jmlivingston/tateru
```

Choose **React**, your package manager, language and optional tools, then name your first component.

::: tip
Existing React workspaces reuse their tooling choices. Language is detected when possible.
:::

## Add another component

Run tateru again, or use the generated workspace's Nx generator:

```sh
npm run create-component -- --name=MyComponent --language=typescript
```

Use `--language=javascript` for JavaScript.

## Build

```sh
npm run build
```

Packages are built into `dist/packages/`. Optional commands such as `npm test`, `npm run lint` and `npm start` are available only when their tools were selected.
