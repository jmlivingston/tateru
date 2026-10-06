import { generateFiles, names, OverwriteStrategy, readJson } from '@nx/devkit';
import { fileURLToPath } from 'url';

const LANGUAGES = ['javascript', 'typescript'];

function getNpmScope(tree) {
  const packageName = readJson(tree, 'package.json').name;
  const scope = packageName?.match(/^(@[^/]+)\//)?.[1];
  if (!scope) {
    throw new Error('Root package.json name must use an npm scope (e.g., "@my-org/root")');
  }
  return scope;
}

export default function componentGenerator(tree, { name, language = 'javascript' }) {
  if (typeof name !== 'string' || !/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
    throw new Error('Component name must be in PascalCase (e.g., Button, MyComponent)');
  }
  if (!LANGUAGES.includes(language)) {
    throw new Error(`Language must be one of: ${LANGUAGES.join(', ')}`);
  }

  const packageRoot = `packages/${name}`;
  if (tree.exists(`${packageRoot}/package.json`)) {
    throw new Error(`Component package ${name} already exists`);
  }

  const substitutions = { ...names(name), npmScope: getNpmScope(tree), tmpl: '' };
  const options = { overwriteStrategy: OverwriteStrategy.ThrowIfExisting };
  for (const folder of ['files', `languages/${language}`]) {
    generateFiles(tree, fileURLToPath(new URL(`./${folder}`, import.meta.url)), packageRoot, substitutions, options);
  }
}
