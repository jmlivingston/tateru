import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { basename, resolve } from 'node:path';

const workspaceRoot = process.cwd();
const projectRoot = resolve(workspaceRoot, process.argv[2] ?? '');

if (!existsSync(resolve(projectRoot, 'package.json'))) {
  throw new Error(`Package manifest not found in ${projectRoot}`);
}

const run = (command, args) => {
  const result = spawnSync(command, args, { cwd: workspaceRoot, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
};

run('vite', ['build', '--config', resolve(projectRoot, 'vite.config.mjs')]);
if (existsSync(resolve(projectRoot, 'tsconfig.build.json'))) {
  run('tsc', ['--project', resolve(projectRoot, 'tsconfig.build.json')]);
}
const outputRoot = resolve(workspaceRoot, 'dist', 'packages', basename(projectRoot));
const removeCssTypeImports = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      removeCssTypeImports(path);
    } else if (entry.isFile() && entry.name.endsWith('.d.ts')) {
      const declaration = readFileSync(path, 'utf8').replace(/^import\s+['"][^'"]+\.css['"];\r?\n/gm, '');
      writeFileSync(path, declaration);
    }
  }
};

if (existsSync(outputRoot)) removeCssTypeImports(outputRoot);
mkdirSync(outputRoot, { recursive: true });
copyFileSync(resolve(projectRoot, 'package.json'), resolve(outputRoot, 'package.json'));
