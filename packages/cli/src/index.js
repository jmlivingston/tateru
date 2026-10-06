import { existsSync } from 'node:fs';
import { isAbsolute, join, relative, resolve } from 'node:path';
import * as p from '@clack/prompts';
import { content, fill } from './content.js';
import { detectLanguage, detectPackageManager, detectWorkspace, hasComponentsDir } from './detect.js';
import { isValidName, toKebab, toPascal } from './names.js';
import {
  ensurePackageJson,
  generateArgs,
  generateReactComponent,
  hasGenerators,
  installCommand,
  installPackages,
  readRootName,
  scaffoldMonorepo,
  scaffoldReactWorkspace,
  writeComponent
} from './scaffold.js';

const { prompts, validation, messages, defaults } = content;

const ask = async (promise) => {
  const answer = await promise;
  if (p.isCancel(answer)) {
    p.cancel(content.cancelled);
    process.exit(0);
  }
  return answer;
};

const options = (entries) => Object.entries(entries).map(([value, { label }]) => ({ value, label }));

const validateDir = (cwd) => (value) => {
  if (!value?.trim()) return validation.required;
  const rel = relative(cwd, resolve(cwd, value.trim()));
  if (rel.startsWith('..') || isAbsolute(rel)) return validation.outsideRoot;
};

const askName = (cwd, dir, toFolder) =>
  ask(
    p.text({
      message: prompts.componentName,
      validate: (value) => {
        if (!value?.trim()) return validation.required;
        if (!isValidName(value)) return validation.invalidName;
        const path = join(dir, toFolder(value));
        if (existsSync(join(cwd, path))) return fill(validation.exists, { path });
      }
    })
  );

const install = async (cwd, packageManager) => {
  const spinner = p.spinner();
  spinner.start(fill(messages.installing, { packageManager }));
  const { ok, output } = await installPackages({ cwd, packageManager });
  if (ok) {
    spinner.stop(messages.installed);
    return true;
  }
  spinner.error(fill(messages.installFailed, { command: installCommand(packageManager).join(' ') }));
  p.log.message(output.trim());
  return false;
};

const runReact = async (cwd, workspace) => {
  const hasNx = existsSync(join(cwd, 'nx.json'));
  if (hasNx && !hasGenerators(cwd)) {
    p.cancel(validation.noGenerators);
    process.exit(1);
  }

  const packageManager =
    workspace?.packageManager ??
    detectPackageManager(cwd) ??
    (await ask(p.select({ message: prompts.packageManager, options: options(content.packageManagers) })));
  const dir = content.react.packagesDir;

  let language = detectLanguage(cwd, { dir, useProjectConfig: !hasNx });
  if (language) {
    p.log.info(fill(messages.languageDetected, { language: content.languages[language].label }));
  } else {
    language = await ask(p.select({ message: prompts.language, options: options(content.languages) }));
  }

  const name = await askName(cwd, dir, toPascal);

  let rootName;
  if (hasNx) {
    rootName = readRootName(cwd);
  } else {
    const { rootName: scaffoldedName, written, skipped } = scaffoldReactWorkspace({ cwd });
    rootName = scaffoldedName;
    p.log.success(fill(messages.reactWorkspaceCreated, { count: written.length }));
    if (skipped.length) p.log.warn(fill(messages.reactWorkspaceSkipped, { files: skipped.join(', ') }));
  }

  const needsInstall = !hasNx || !existsSync(join(cwd, content.react.nxBinary));
  if (needsInstall && !(await install(cwd, packageManager))) return;

  const args = generateArgs({ rootName, name, language });
  const spinner = p.spinner();
  spinner.start(fill(messages.generating, { name: toPascal(name) }));
  const { ok, output } = await generateReactComponent({ cwd, rootName, name, language });
  if (!ok) {
    spinner.error(fill(messages.generateFailed, { command: `nx ${args.join(' ')}` }));
    p.log.message(output.trim());
    return;
  }
  spinner.stop(fill(messages.generated, { name: toPascal(name) }));

  p.outro(fill(messages.summaryReact, { name: toPascal(name), path: join(dir, toPascal(name)) }));
};

const runComponent = async (cwd, workspace, framework) => {
  let packageManager;
  let dir;
  let monorepo = false;

  if (workspace) {
    ({ packageManager, packagesDir: dir } = workspace);
    p.log.info(fill(messages.monorepoDetected, { packageManager, dir }));
  } else {
    monorepo = await ask(
      p.select({
        message: prompts.isMonorepo,
        options: [
          { value: true, label: prompts.yes },
          { value: false, label: prompts.no }
        ],
        initialValue: false
      })
    );

    if (monorepo) {
      packageManager = await ask(
        p.select({ message: prompts.packageManager, options: options(content.packageManagers) })
      );
      dir = await ask(
        p.text({
          message: prompts.packagesDir,
          initialValue: defaults.packagesDir,
          validate: validateDir(cwd)
        })
      );
    } else {
      dir = await ask(
        p.text({
          message: prompts.componentsDir,
          initialValue: hasComponentsDir(cwd) ? defaults.componentsDir : '',
          validate: validateDir(cwd)
        })
      );
    }
    dir = dir.trim();
  }

  const name = await askName(cwd, dir, toKebab);

  const asPackage = Boolean(packageManager);
  if (!monorepo && ensurePackageJson(cwd)) {
    p.log.success(fill(messages.created, { path: 'package.json' }));
  }
  if (monorepo) {
    for (const file of scaffoldMonorepo({ cwd, packageManager, packagesDir: dir })) {
      p.log.success(fill(messages.created, { path: file }));
    }
  }

  const { target, written } = writeComponent({ cwd, dir, framework, name, asPackage });
  const location = relative(cwd, target) || '.';
  for (const file of written) {
    p.log.success(fill(messages.created, { path: join(location, file) }));
  }

  if (asPackage) await install(cwd, packageManager);

  p.outro(
    fill(messages.summary, { framework: content.frameworks[framework].label, name: toPascal(name), path: location })
  );
};

export const main = async (cwd = process.cwd()) => {
  p.intro(content.intro);

  const workspace = detectWorkspace(cwd);
  const framework = await ask(
    p.select({ message: prompts.framework, options: options(content.frameworks) })
  );

  if (content.frameworks[framework].workspace) await runReact(cwd, workspace);
  else await runComponent(cwd, workspace, framework);
};
