import { generateFiles, names, OverwriteStrategy, readJson } from '@nx/devkit';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { FEATURES, readFeatures } from '../features.js';
import { renderTargets } from '../targets.js';

function getNpmScope(tree) {
  const packageName = readJson(tree, 'package.json').name;
  const scope = packageName?.match(/^(@[^/]+)\//)?.[1];
  if (!scope) throw new Error('Root package.json name must use an npm scope (e.g., "@my-org/root")');
  return scope;
}

export default function componentGenerator(tree, { name, language = 'typescript' }) {
  if (typeof name !== 'string' || !/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
    throw new Error('Component name must be in PascalCase (e.g., Button, MyComponent)');
  }
  if (language !== 'typescript') throw new Error('Angular components only support TypeScript');

  const packageRoot = `packages/${name}`;
  if (tree.exists(`${packageRoot}/package.json`)) throw new Error(`Component package ${name} already exists`);

  const features = readFeatures(tree);
  const enabled = FEATURES.filter((feature) => features[feature]);
  const substitutions = { ...names(name), ...features, npmScope: getNpmScope(tree), language, tmpl: '' };
  substitutions.targets = renderTargets(substitutions);
  const folders = [
    'files',
    `languages/${language}`,
    ...enabled.flatMap((feature) => [`features/${feature}/files`, `features/${feature}/languages/${language}`]),
  ];
  const options = { overwriteStrategy: OverwriteStrategy.ThrowIfExisting };

  for (const folder of folders) {
    const source = fileURLToPath(new URL(`./${folder}`, import.meta.url));
    if (existsSync(source)) generateFiles(tree, source, packageRoot, substitutions, options);
  }
}
