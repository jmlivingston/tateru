import { existsSync, readdirSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function findSourceEntry(root, sourceRoot) {
  const candidates = ['index.ts', 'index.js'].map((file) => join(root, sourceRoot, file));
  return candidates.find((candidate) => existsSync(candidate)) ?? candidates[1];
}

function readManifest(root, dir, file) {
  try {
    return JSON.parse(readFileSync(join(root, 'packages', dir, file), 'utf-8'));
  } catch (error) {
    throw new Error(`Package "${dir}" has a missing or invalid ${file}: ${error.message}`);
  }
}

function readPackages(root) {
  return readdirSync(join(root, 'packages'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
    .sort()
    .map((dir) => {
      const packageJson = readManifest(root, dir, 'package.json');
      const projectJson = readManifest(root, dir, 'project.json');
      return {
        kind: projectJson.projectType,
        record: {
          dir,
          projectName: projectJson.name,
          npmName: packageJson.name,
          sourceEntry: findSourceEntry(root, projectJson.sourceRoot),
          distDir: join(root, 'dist', 'packages', dir),
        },
      };
    });
}

export function listComponentPackages({ root = REPO_ROOT } = {}) {
  return readPackages(root)
    .filter((pkg) => pkg.kind !== 'application')
    .map((pkg) => pkg.record);
}

export function listComponentStylesheetAliases({ root = REPO_ROOT } = {}) {
  return Object.fromEntries(
    listComponentPackages({ root }).flatMap(({ dir, npmName }) => {
      const sourceDir = join(root, 'packages', dir, 'src');
      const packageJson = readManifest(root, dir, 'package.json');
      const rootExport = packageJson.exports?.['.'];
      const defaultStylesheet =
        typeof rootExport === 'string' && rootExport.endsWith('.css') ? 'styles.css' : `${dir}.css`;
      const aliases = [[`${npmName}/style.css`, join(sourceDir, defaultStylesheet)]];

      if (existsSync(sourceDir)) {
        aliases.push(
          ...readdirSync(sourceDir, { withFileTypes: true })
            .filter((entry) => entry.isFile() && entry.name.endsWith('.css'))
            .map((entry) => [`${npmName}/${entry.name}`, join(sourceDir, entry.name)]),
        );
      }

      return aliases;
    }),
  );
}

export function findComponentPackage(input, { root = REPO_ROOT } = {}) {
  const wanted = input.toLowerCase();
  return (
    listComponentPackages({ root }).find(({ dir, projectName, npmName }) =>
      [dir, projectName, npmName, npmName.split('/').pop()].some((name) => name.toLowerCase() === wanted),
    ) ?? null
  );
}
