const commandTarget = (command, cwd) => ({
  executor: 'nx:run-commands',
  options: cwd ? { command, cwd } : { command },
});

export function renderTargets({ className, prettier, eslint, stylelint, tests, isCss = false }) {
  const cwd = `packages/${className}`;
  const targets = {
    build: isCss
      ? commandTarget(`node scripts/copyCssPackage.js ${cwd}`)
      : commandTarget(`ng-packagr -p ${cwd}/ng-package.json`),
    ...(prettier && { format: commandTarget('prettier --write .', cwd) }),
    ...(tests && !isCss && {
      test: commandTarget(`vitest run --config ${cwd}/vite.config.mjs`),
    }),
    ...(eslint && !isCss && {
      lint: commandTarget(`eslint --fix --cache --cache-location node_modules/.cache/eslint/ ${cwd}`),
    }),
    ...(stylelint && { 'lint-style': commandTarget('stylelint --fix "**/*.css"', cwd) }),
  };
  return JSON.stringify(targets, null, 2).replace(/\n/g, '\n  ');
}
