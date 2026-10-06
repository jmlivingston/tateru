import { existsSync } from 'node:fs';
import { join } from 'node:path';
import * as p from '@clack/prompts';
import { content, fill } from './content.js';
import { detectLanguage, detectPackageManager, detectWorkspace } from './detect.js';
import { isValidName, toPascal } from './names.js';
import {
  generateArgs,
  generateComponent,
  hasGenerators,
  installCommand,
  installPackages,
  readRootName,
  readWorkspaceFramework,
  scaffoldWorkspace,
  supportedFeatures,
} from './scaffold.js';

const { prompts, validation, messages } = content;

const ask = async (promise) => {
  const answer = await promise;
  if (p.isCancel(answer)) {
    p.cancel(content.cancelled);
    process.exit(0);
  }
  return answer;
};

const options = (entries) => Object.entries(entries).map(([value, { label }]) => ({ value, label }));

const askName = (cwd, dir, toFolder) =>
  ask(
    p.text({
      message: prompts.componentName,
      validate: (value) => {
        if (!value?.trim()) return validation.required;
        if (!isValidName(value)) return validation.invalidName;
        const path = join(dir, toFolder(value));
        if (existsSync(join(cwd, path))) return fill(validation.exists, { path });
      },
    }),
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
  process.exitCode = 1;
  return false;
};

const runWorkspace = async (cwd, workspace, framework) => {
  const hasNx = existsSync(join(cwd, 'nx.json'));
  if (hasNx && !hasGenerators(cwd)) {
    p.cancel(validation.noGenerators);
    process.exit(1);
  }
  const existingFramework = readWorkspaceFramework(cwd);
  if (existingFramework && existingFramework !== framework) {
    p.cancel(fill(validation.frameworkMismatch, { existing: existingFramework }));
    process.exitCode = 1;
    return;
  }

  const packageManager =
    workspace?.packageManager ??
    detectPackageManager(cwd) ??
    (await ask(p.select({ message: prompts.packageManager, options: options(content.packageManagers) })));
  const dir = content.workspace.packagesDir;

  let language = content.frameworks[framework].language ?? detectLanguage(cwd, { dir, useProjectConfig: !hasNx });
  if (language && !content.frameworks[framework].language) {
    p.log.info(fill(messages.languageDetected, { language: content.languages[language].label }));
  } else if (!language) {
    language = await ask(p.select({ message: prompts.language, options: options(content.languages) }));
  }

  const features = Object.fromEntries(Object.keys(content.features).map((feature) => [feature, false]));
  if (!hasNx) {
    for (const feature of supportedFeatures(framework)) {
      features[feature] = await ask(p.confirm({ message: content.features[feature], initialValue: true }));
    }
  }

  const name = await askName(cwd, dir, toPascal);

  let rootName;
  if (hasNx) {
    rootName = readRootName(cwd);
  } else {
    const {
      rootName: scaffoldedName,
      written,
      skipped,
    } = scaffoldWorkspace({ cwd, framework, features, packageManager });
    rootName = scaffoldedName;
    p.log.success(
      fill(messages.workspaceCreated, { count: written.length, framework: content.frameworks[framework].label }),
    );
    if (skipped.length) p.log.warn(fill(messages.workspaceSkipped, { files: skipped.join(', ') }));
  }

  const needsInstall = !hasNx || !existsSync(join(cwd, content.workspace.nxBinary));
  if (needsInstall && !(await install(cwd, packageManager))) return;

  const args = generateArgs({ rootName, name, language });
  const spinner = p.spinner();
  spinner.start(fill(messages.generating, { name: toPascal(name) }));
  const { ok, output } = await generateComponent({ cwd, rootName, name, language });
  if (!ok) {
    spinner.error(fill(messages.generateFailed, { command: `nx ${args.join(' ')}` }));
    p.log.message(output.trim());
    process.exitCode = 1;
    return;
  }
  spinner.stop(fill(messages.generated, { name: toPascal(name) }));

  p.outro(
    fill(messages.workspaceSummary, {
      framework: content.frameworks[framework].label,
      name: toPascal(name),
      path: join(dir, toPascal(name)),
    }),
  );
};

export const main = async (cwd = process.cwd()) => {
  p.intro(content.intro);

  const workspace = detectWorkspace(cwd);
  const framework = await ask(p.select({ message: prompts.framework, options: options(content.frameworks) }));

  await runWorkspace(cwd, workspace, framework);
};
