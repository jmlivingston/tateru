import { readJson } from '@nx/devkit';

export const FEATURES = ['prettier', 'eslint', 'stylelint', 'tests'];

export function readFeatures(tree) {
  const configured = tree.exists('tateru.json') ? (readJson(tree, 'tateru.json').features ?? {}) : {};
  return Object.fromEntries(FEATURES.map((feature) => [feature, configured[feature] ?? true]));
}
