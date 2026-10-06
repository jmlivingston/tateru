import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';

// Fixture repos are generated at runtime so Nx never discovers their project.json files.
const roots = [];

export function createRepo(packages) {
  const root = mkdtempSync(join(tmpdir(), 'packages-test-'));
  roots.push(root);
  for (const [dir, files] of Object.entries(packages)) {
    mkdirSync(join(root, 'packages', dir), { recursive: true });
    for (const [file, contents] of Object.entries(files)) {
      const filePath = join(root, 'packages', dir, file);
      mkdirSync(dirname(filePath), { recursive: true });
      writeFileSync(filePath, typeof contents === 'string' ? contents : JSON.stringify(contents));
    }
  }
  return root;
}

export function removeRepos() {
  roots.splice(0).forEach((root) => rmSync(root, { recursive: true, force: true }));
}

export function componentPackage(dir, projectName, npmName) {
  return {
    'package.json': { name: npmName },
    'project.json': {
      name: projectName,
      projectType: 'library',
      sourceRoot: `packages/${dir}/src`,
    },
  };
}

export function storybookPackage(dir = 'Storybook') {
  return {
    'package.json': {
      name: '@example/storybook',
      private: true,
    },
    'project.json': {
      name: '@example/storybook',
      projectType: 'application',
      sourceRoot: `packages/${dir}`,
    },
  };
}
