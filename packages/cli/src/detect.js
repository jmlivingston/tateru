import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { content } from './content.js';

const readJson = (path) => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
};

const isDirectory = (path) => existsSync(path) && statSync(path).isDirectory();

export const detectPackageManager = (cwd) => {
  const pkg = readJson(join(cwd, 'package.json'));
  const field = pkg?.packageManager?.split('@')[0];
  if (field in content.packageManagers) return field;
  if (existsSync(join(cwd, 'bun.lock')) || existsSync(join(cwd, 'bun.lockb'))) return 'bun';
  if (existsSync(join(cwd, 'yarn.lock'))) return 'yarn';
  if (existsSync(join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(join(cwd, 'package-lock.json'))) return 'npm';
  return null;
};

const parsePnpmGlobs = (path) => {
  const globs = [];
  let inPackages = false;
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    if (/^packages\s*:/.test(line)) inPackages = true;
    else if (/^\S/.test(line)) inPackages = false;
    else if (inPackages) {
      const match = line.match(/^\s*-\s*['"]?([^'"#]+?)['"]?\s*(#.*)?$/);
      if (match) globs.push(match[1]);
    }
  }
  return globs;
};

const globsToDir = (globs) => {
  const dirs = globs
    .filter((glob) => !glob.startsWith('!'))
    .map((glob) => glob.replace(/\/\*{1,2}$/, ''))
    .filter((dir) => dir && !/[*?{}[\]]/.test(dir));
  const fallback = content.defaults.packagesDir;
  return dirs.includes(fallback) ? fallback : (dirs[0] ?? fallback);
};

export const detectWorkspace = (cwd) => {
  const pkg = readJson(join(cwd, 'package.json'));
  const pnpmFile = join(cwd, 'pnpm-workspace.yaml');

  if (existsSync(pnpmFile)) {
    return { packageManager: 'pnpm', packagesDir: globsToDir(parsePnpmGlobs(pnpmFile)) };
  }

  const workspaces = Array.isArray(pkg?.workspaces) ? pkg.workspaces : pkg?.workspaces?.packages;
  if (Array.isArray(workspaces)) {
    return { packageManager: detectPackageManager(cwd) ?? 'npm', packagesDir: globsToDir(workspaces) };
  }

  return null;
};

export const hasComponentsDir = (cwd) => isDirectory(join(cwd, content.defaults.componentsDir));

const SOURCE_LANGUAGES = { '.ts': 'typescript', '.tsx': 'typescript', '.js': 'javascript', '.jsx': 'javascript' };
const SKIPPED_DIRECTORIES = new Set(['node_modules', 'dist', 'storybook-static']);

const scanLanguages = (dir, found = new Set()) => {
  if (!isDirectory(dir)) return found;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('.') && !SKIPPED_DIRECTORIES.has(entry.name))
        scanLanguages(join(dir, entry.name), found);
    } else if (!entry.name.endsWith('.d.ts') && SOURCE_LANGUAGES[extname(entry.name)]) {
      found.add(SOURCE_LANGUAGES[extname(entry.name)]);
    }
  }
  return found;
};

// Source files in dir win. Project config is only consulted before tateru has written its own tsconfig and typescript dependency.
export const detectLanguage = (cwd, { dir, useProjectConfig }) => {
  const found = scanLanguages(join(cwd, dir));
  if (found.size === 1) return [...found][0];
  if (found.size > 1 || !useProjectConfig) return null;

  const pkg = readJson(join(cwd, 'package.json'));
  const dependencies = { ...pkg?.dependencies, ...pkg?.devDependencies };
  if (existsSync(join(cwd, 'tsconfig.json')) || 'typescript' in dependencies) return 'typescript';
  if (existsSync(join(cwd, 'jsconfig.json'))) return 'javascript';
  return null;
};
