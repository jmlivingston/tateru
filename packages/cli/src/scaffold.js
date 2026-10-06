import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { content, fill } from './content.js';
import { toKebab, toPascal } from './names.js';
import { copyTemplate, readTemplate } from './templates.js';

const writeJson = (path, data) => writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);

const readOrCreatePackageJson = (cwd) => {
  const pkgPath = join(cwd, 'package.json');
  if (existsSync(pkgPath)) return { pkgPath, pkg: JSON.parse(readFileSync(pkgPath, 'utf8')), isNew: false };
  const pkg = { name: toKebab(basename(cwd)) || 'workspace', version: '1.0.0', private: true };
  return { pkgPath, pkg, isNew: true };
};

export const ensurePackageJson = (cwd) => {
  const { pkgPath, pkg, isNew } = readOrCreatePackageJson(cwd);
  if (isNew) writeJson(pkgPath, pkg);
  return isNew;
};

export const scaffoldMonorepo = ({ cwd, packageManager, packagesDir }) => {
  const created = [];
  const glob = `${packagesDir}/*`;

  if (packageManager === 'pnpm') {
    const file = join(cwd, 'pnpm-workspace.yaml');
    writeFileSync(file, `packages:\n  - '${glob}'\n`);
    created.push('pnpm-workspace.yaml');
  }

  const { pkgPath, pkg, isNew } = readOrCreatePackageJson(cwd);

  if (packageManager !== 'pnpm') pkg.workspaces = [glob];
  if (isNew) created.push('package.json');
  writeJson(pkgPath, pkg);

  mkdirSync(join(cwd, packagesDir), { recursive: true });
  return created;
};

export const writeComponent = ({ cwd, dir, framework, name, asPackage }) => {
  const kebab = toKebab(name);
  const vars = { Name: toPascal(name), kebab };
  const target = join(cwd, dir, kebab);
  const { dependencies, files } = content.frameworks[framework];
  const written = [];

  mkdirSync(target, { recursive: true });

  if (asPackage) {
    writeJson(join(target, 'package.json'), { name: kebab, version: '1.0.0', private: true, dependencies });
    written.push('package.json');
  }

  for (const [fileName, body] of Object.entries(files)) {
    const resolved = fill(fileName, vars);
    writeFileSync(join(target, resolved), fill(body, vars));
    written.push(resolved);
  }

  return { target, written };
};

export const installCommand = (packageManager) => content.packageManagers[packageManager].install;

export const run = (command, args, { cwd, env } = {}) =>
  new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
      shell: process.platform === 'win32',
    });
    let output = '';
    child.stdout.on('data', (chunk) => (output += chunk));
    child.stderr.on('data', (chunk) => (output += chunk));
    child.on('error', (error) => resolve({ ok: false, output: String(error) }));
    child.on('close', (code) => resolve({ ok: code === 0, output }));
  });

export const installPackages = ({ cwd, packageManager }) => {
  const [command, ...args] = installCommand(packageManager);
  return run(command, args, { cwd });
};

const MERGED_KEYS = ['scripts', 'dependencies', 'devDependencies', 'allowScripts', 'nx'];

const mergePackageJson = (template, existing) => ({
  ...template,
  ...existing,
  name: template.name,
  type: template.type,
  generators: template.generators,
  ...Object.fromEntries(MERGED_KEYS.map((key) => [key, { ...template[key], ...existing[key] }])),
});

const workspaceNames = (cwd, existingName) => {
  const directoryName = toKebab(basename(cwd)) || 'workspace';
  const scoped = existingName?.match(/^(@[^/]+)\//);
  const scope = scoped ? scoped[1] : `@${toKebab(existingName ?? '') || directoryName}`;
  return { name: directoryName, scope, rootName: scoped ? existingName : `${scope}/root` };
};

export const hasGenerators = (cwd) => existsSync(join(cwd, content.react.generatorsFile));

export const scaffoldReactWorkspace = ({ cwd, features }) => {
  const pkgPath = join(cwd, 'package.json');
  const existing = existsSync(pkgPath) ? JSON.parse(readFileSync(pkgPath, 'utf8')) : null;
  const vars = { ...workspaceNames(cwd, existing?.name), ...features };
  const base = `${content.react.template}/base`;
  const template = JSON.parse(readTemplate(base, 'package.json.tpl', vars));
  const enabled = Object.keys(content.features).filter((feature) => features[feature]);

  writeJson(pkgPath, existing ? mergePackageJson(template, existing) : template);
  const { written, skipped } = copyTemplate({
    names: [
      base,
      ...enabled.flatMap((feature) => [`${content.react.template}/features/${feature}`, `common/features/${feature}`]),
    ],
    target: cwd,
    vars,
  });

  return {
    rootName: vars.rootName,
    written: ['package.json', ...written],
    skipped: skipped.filter((file) => file !== 'package.json'),
  };
};

export const generateArgs = ({ rootName, name, language }) => [
  'generate',
  `${rootName}:component`,
  `--name=${toPascal(name)}`,
  `--language=${language}`,
];

export const generateReactComponent = ({ cwd, rootName, name, language }) =>
  run(join(cwd, content.react.nxBinary), generateArgs({ rootName, name, language }), {
    cwd,
    env: { NX_DAEMON: 'false' },
  });

export const readRootName = (cwd) => JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8')).name;
