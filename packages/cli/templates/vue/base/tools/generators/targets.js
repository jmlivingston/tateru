const runCommand = (command, cwd) => ({
  executor: 'nx:run-commands',
  options: cwd ? { command, cwd } : { command },
});

export function renderTargets({ className, fileName, npmScope, prettier, eslint, stylelint, tests }) {
  const cwd = `packages/${className}`;
  const targets = {
    ...(prettier && { format: runCommand('prettier --write .', cwd) }),
    ...(tests && { test: runCommand(`vitest run --project ${npmScope}/${fileName}`) }),
    ...(eslint && { lint: runCommand(`eslint --fix --cache --cache-location node_modules/.cache/eslint/ ${cwd}`) }),
    ...(stylelint && { 'lint-style': runCommand('stylelint --fix "**/*.css"', cwd) }),
  };
  return JSON.stringify(targets, null, 2).replace(/\n/g, '\n  ');
}
