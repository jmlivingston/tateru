# tateru

Nx workspace for the tateru tools.

| Package | Description |
|---|---|
| [@tateru/cli](packages/cli) | Interactive component and workspace scaffolder |
| [@tateru/docs](packages/docs) | Static VitePress documentation |

```sh
npm install
npx nx run-many -t test
```

## Documentation

```sh
npx nx run @tateru/docs:dev
npx nx run @tateru/docs:build
npx nx run @tateru/docs:preview
```

Markdown content lives in `packages/docs`. Navigation is configured in
`packages/docs/.vitepress/content.json`.

In GitHub **Settings > Pages**, select **GitHub Actions** as the source.
The documentation workflow builds pull requests and deploys pushes to `main`
to https://jmlivingston.github.io/tateru/. It can also be run manually.
