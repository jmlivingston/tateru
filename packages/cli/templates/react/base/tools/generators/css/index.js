import { generateFiles, names, OverwriteStrategy, readJson } from '@nx/devkit';
import { fileURLToPath } from 'url';
import { readFeatures } from '../features.js';
import { renderTargets } from '../targets.js';

function getNpmScope(tree) {
  const packageName = readJson(tree, 'package.json').name;
  const scope = packageName?.match(/^(@[^/]+)\//)?.[1];
  if (!scope) {
    throw new Error('Root package.json name must use an npm scope (e.g., "@my-org/root")');
  }
  return scope;
}

export default function cssGenerator(tree, { name }) {
  if (typeof name !== 'string' || !/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
    throw new Error('CSS package name must be in PascalCase (e.g., Reset, DesignTokens)');
  }

  const packageRoot = `packages/${name}`;
  if (tree.exists(`${packageRoot}/package.json`)) {
    throw new Error(`CSS package ${name} already exists`);
  }

  const substitutions = { ...names(name), ...readFeatures(tree), npmScope: getNpmScope(tree), tmpl: '' };
  substitutions.targets = renderTargets({ ...substitutions, tests: false });

  generateFiles(tree, fileURLToPath(new URL('./files', import.meta.url)), packageRoot, substitutions, {
    overwriteStrategy: OverwriteStrategy.ThrowIfExisting,
  });
}
