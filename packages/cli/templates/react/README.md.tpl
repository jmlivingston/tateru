# {{name}}

React component library built with Nx, Vite and Storybook. Each component in `packages/` is its own publishable package.

## Commands

```sh
npm install
npm start                                   # Storybook on http://localhost:4000
npm run create-component -- --name=MyThing  # new component package (PascalCase), JavaScript or TypeScript
npm run create-css -- --name=DesignTokens   # new shared CSS package
npm test
npm run build                               # output in dist/packages
npm run lint
```

## Structure

```
packages/<Name>/   component packages and the Storybook app
scripts/           shared Vite and Storybook configuration
tools/generators/  Nx generators behind create-component and create-css
```

Packages are discovered from `packages/`, so new components need no extra wiring. To publish one, run `npm publish` inside `dist/packages/<Name>`.
