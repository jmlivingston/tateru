import assert from 'node:assert/strict';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';
import { content, fill } from '../src/content.js';
import { detectLanguage, detectPackageManager, detectWorkspace, hasComponentsDir } from '../src/detect.js';
import { toKebab, toPascal, isValidName } from '../src/names.js';
import {
  ensurePackageJson,
  generateArgs,
  hasGenerators,
  scaffoldMonorepo,
  scaffoldReactWorkspace,
  scaffoldWorkspace,
  supportedFeatures,
  readWorkspaceFramework,
} from '../src/scaffold.js';

const allFeatures = Object.fromEntries(Object.keys(content.features).map((feature) => [feature, true]));
const roots = [];
const tmp = () => {
  const root = mkdtempSync(join(tmpdir(), 'tateru-'));
  roots.push(root);
  return root;
};
after(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

test('name helpers', () => {
  assert.equal(toPascal('my button'), 'MyButton');
  assert.equal(toKebab('MyButton'), 'my-button');
  assert.equal(toKebab('my_cool-thing'), 'my-cool-thing');
  assert.equal(isValidName('1abc'), false);
  assert.equal(isValidName('Button'), true);
});

test('detects no workspace in an empty directory', () => {
  assert.equal(detectWorkspace(tmp()), null);
});

test('detects npm, yarn, bun and pnpm workspaces', () => {
  const cases = [
    ['npm', {}, 'package-lock.json'],
    ['yarn', {}, 'yarn.lock'],
    ['bun', {}, 'bun.lock'],
    ['pnpm', { packageManager: 'pnpm@9.0.0' }, null],
  ];
  for (const [pm, extra, lock] of cases) {
    const dir = tmp();
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ workspaces: ['libs/*'], ...extra }));
    if (lock) writeFileSync(join(dir, lock), '');
    assert.deepEqual(detectWorkspace(dir), { packageManager: pm, packagesDir: 'libs' });
  }
});

test('detects pnpm-workspace.yaml and object-form workspaces', () => {
  const dir = tmp();
  writeFileSync(join(dir, 'pnpm-workspace.yaml'), 'packages:\n  - \'apps/*\'\n  - "packages/*"\n');
  assert.deepEqual(detectWorkspace(dir), { packageManager: 'pnpm', packagesDir: 'packages' });

  const other = tmp();
  writeFileSync(join(other, 'package.json'), JSON.stringify({ workspaces: { packages: ['pkgs/**'] } }));
  assert.equal(detectWorkspace(other).packagesDir, 'pkgs');
});

test('detects components directory', () => {
  const dir = tmp();
  assert.equal(hasComponentsDir(dir), false);
  mkdirSync(join(dir, 'components'));
  assert.equal(hasComponentsDir(dir), true);
});

test('scaffolds npm and pnpm monorepos', () => {
  const npm = tmp();
  scaffoldMonorepo({ cwd: npm, packageManager: 'npm', packagesDir: 'packages' });
  assert.deepEqual(JSON.parse(readFileSync(join(npm, 'package.json'), 'utf8')).workspaces, ['packages/*']);
  assert.deepEqual(detectWorkspace(npm), { packageManager: 'npm', packagesDir: 'packages' });

  const pnpm = tmp();
  scaffoldMonorepo({ cwd: pnpm, packageManager: 'pnpm', packagesDir: 'packages' });
  assert.deepEqual(detectWorkspace(pnpm), { packageManager: 'pnpm', packagesDir: 'packages' });
});

test('preserves an existing package.json', () => {
  const dir = tmp();
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'keep', scripts: { a: 'b' } }));
  scaffoldMonorepo({ cwd: dir, packageManager: 'yarn', packagesDir: 'packages' });
  const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
  assert.equal(pkg.name, 'keep');
  assert.deepEqual(pkg.scripts, { a: 'b' });
  assert.deepEqual(pkg.workspaces, ['packages/*']);
});

test('creates package.json only when missing', () => {
  const dir = tmp();
  assert.equal(ensurePackageJson(dir), true);
  assert.equal(JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).private, true);
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'keep' }));
  assert.equal(ensurePackageJson(dir), false);
  assert.equal(JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).name, 'keep');
});

test('detects a package manager only when there is evidence', () => {
  const dir = tmp();
  assert.equal(detectPackageManager(dir), null);
  writeFileSync(join(dir, 'pnpm-lock.yaml'), '');
  assert.equal(detectPackageManager(dir), 'pnpm');
});

test('scaffolds the React workspace in an empty directory', () => {
  const dir = tmp();
  const { rootName, written, skipped } = scaffoldReactWorkspace({ cwd: dir, features: allFeatures });
  const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));

  assert.match(rootName, /^@[^/]+\/root$/);
  assert.equal(pkg.name, rootName);
  assert.equal(pkg.type, 'module');
  assert.ok(pkg.scripts['create-component'].includes(rootName));
  assert.deepEqual(skipped, []);
  assert.ok(written.includes('nx.json'));
  assert.ok(hasGenerators(dir));
  assert.ok(existsSync(join(dir, '.gitignore')));
  assert.ok(existsSync(join(dir, 'packages/Storybook/package.json')));
  assert.equal(JSON.parse(readFileSync(join(dir, 'project.json'), 'utf8')).name, toKebab(dir.split('/').pop()));
});

test('keeps Nx generator templates unrendered', () => {
  const dir = tmp();
  scaffoldReactWorkspace({ cwd: dir, features: allFeatures });
  const template = readFileSync(join(dir, 'tools/generators/component/files/package.json.template'), 'utf8');
  assert.ok(template.includes('<%= npmScope %>'));
});

test('merges into an existing package.json and keeps existing files', () => {
  const dir = tmp();
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({ name: 'my app', type: 'commonjs', scripts: { test: 'mine' }, devDependencies: { left: '1.0.0' } }),
  );
  writeFileSync(join(dir, 'README.md'), 'keep');

  const { rootName, skipped } = scaffoldReactWorkspace({ cwd: dir, features: allFeatures });
  const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));

  assert.equal(rootName, '@my-app/root');
  assert.equal(pkg.name, '@my-app/root');
  assert.equal(pkg.type, 'module');
  assert.equal(pkg.scripts.test, 'mine');
  assert.ok(pkg.scripts.build);
  assert.equal(pkg.devDependencies.left, '1.0.0');
  assert.ok(pkg.devDependencies.nx);
  assert.deepEqual(skipped, ['README.md']);
  assert.equal(readFileSync(join(dir, 'README.md'), 'utf8'), 'keep');
});

test('keeps an existing scoped root name', () => {
  const dir = tmp();
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: '@acme/mono' }));
  assert.equal(scaffoldReactWorkspace({ cwd: dir, features: allFeatures }).rootName, '@acme/mono');
});

test('builds the nx generate arguments with a PascalCase name', () => {
  assert.deepEqual(generateArgs({ rootName: '@acme/root', name: 'fancy button', language: 'typescript' }), [
    'generate',
    './tools/generators/generators.json:component',
    '--name=FancyButton',
    '--language=typescript',
  ]);
});

const writeFile = (dir, file, body = '') => {
  mkdirSync(join(dir, file, '..'), { recursive: true });
  writeFileSync(join(dir, file), body);
};

test('cannot detect a language in an empty directory', () => {
  assert.equal(detectLanguage(tmp(), { dir: 'packages', useProjectConfig: true }), null);
});

test('detects the language from existing source files', () => {
  const ts = tmp();
  writeFile(ts, 'packages/Button/src/index.ts');
  writeFile(ts, 'packages/Button/vite.config.mjs');
  assert.equal(detectLanguage(ts, { dir: 'packages', useProjectConfig: false }), 'typescript');

  const js = tmp();
  writeFile(js, 'packages/Button/src/Button.jsx');
  writeFile(js, 'packages/Button/node_modules/dep/index.ts');
  assert.equal(detectLanguage(js, { dir: 'packages', useProjectConfig: false }), 'javascript');
});

test('cannot detect a language from mixed sources', () => {
  const dir = tmp();
  writeFile(dir, 'packages/A/src/index.ts');
  writeFile(dir, 'packages/B/src/index.js');
  writeFile(dir, 'tsconfig.json', '{}');
  assert.equal(detectLanguage(dir, { dir: 'packages', useProjectConfig: true }), null);
});

test('falls back to project config only when allowed', () => {
  const ts = tmp();
  writeFile(ts, 'tsconfig.json', '{}');
  assert.equal(detectLanguage(ts, { dir: 'packages', useProjectConfig: true }), 'typescript');
  assert.equal(detectLanguage(ts, { dir: 'packages', useProjectConfig: false }), null);

  const dep = tmp();
  writeFile(dep, 'package.json', JSON.stringify({ devDependencies: { typescript: '^5.0.0' } }));
  assert.equal(detectLanguage(dep, { dir: 'packages', useProjectConfig: true }), 'typescript');

  const js = tmp();
  writeFile(js, 'jsconfig.json', '{}');
  assert.equal(detectLanguage(js, { dir: 'packages', useProjectConfig: true }), 'javascript');
});

test('fill keeps or drops sections by variable', () => {
  const text = 'a\n{{#x}}\nyes {{n}}\n{{/x}}\n{{^x}}\nno\n{{/x}}\nz\n';
  assert.equal(fill(text, { x: true, n: 1 }), 'a\nyes 1\nz\n');
  assert.equal(fill(text, { x: false, n: 1 }), 'a\nno\nz\n');
});

test('detects TypeScript and JavaScript in Vue and Svelte scripts', () => {
  for (const extension of ['vue', 'svelte']) {
    for (const language of ['typescript', 'javascript']) {
      const dir = tmp();
      writeFile(
        dir,
        `packages/Button/src/Button.${extension}`,
        `<script${language === 'typescript' ? ' lang="ts"' : ''}>\n</script>`,
      );
      assert.equal(detectLanguage(dir, { dir: 'packages', useProjectConfig: false }), language);
    }
  }
});

test('Solid excludes Storybook and Angular requires TypeScript', () => {
  assert.ok(!supportedFeatures('solid').includes('storybook'));
  assert.equal(content.frameworks.angular.language, 'typescript');
  assert.throws(() => scaffoldWorkspace({ cwd: tmp(), framework: 'solid', features: allFeatures }), /does not support/);
});

test('pnpm scaffolding creates a packages workspace and records the framework', () => {
  const dir = tmp();
  scaffoldWorkspace({ cwd: dir, framework: 'react', features: allFeatures, packageManager: 'pnpm' });
  assert.equal(readWorkspaceFramework(dir), 'react');
  assert.deepEqual(detectWorkspace(dir), { packageManager: 'pnpm', packagesDir: 'packages' });
});

test('recognizes legacy React workspaces without a framework field', () => {
  const dir = tmp();
  writeFile(dir, 'tateru.json', JSON.stringify({ features: allFeatures }));
  writeFile(dir, 'package.json', JSON.stringify({ dependencies: { react: '^19.0.0' } }));
  assert.equal(readWorkspaceFramework(dir), 'react');
});

test('all frameworks render valid workspaces for every supported feature combination', () => {
  for (const framework of Object.keys(content.frameworks)) {
    const supported = supportedFeatures(framework);
    for (let mask = 0; mask < 1 << supported.length; mask++) {
      const features = Object.fromEntries(Object.keys(content.features).map((feature) => [feature, false]));
      supported.forEach((feature, index) => {
        features[feature] = Boolean(mask & (1 << index));
      });
      const dir = tmp();
      scaffoldWorkspace({ cwd: dir, framework, features });
      assert.equal(readWorkspaceFramework(dir), framework);
      assert.deepEqual(JSON.parse(readFileSync(join(dir, 'tateru.json'), 'utf8')), { framework, features });
      for (const file of readdirSync(dir, { recursive: true })) {
        if (statSync(join(dir, file)).isDirectory()) continue;
        const body = readFileSync(join(dir, file), 'utf8');
        if (file.endsWith('.json')) JSON.parse(body);
        if (!file.includes('tools/generators/') && !file.endsWith('.template') && !file.endsWith('__tmpl__')) {
          assert.ok(!/\{\{[#^/]?\w+\}\}/.test(body), `${framework}: ${file}`);
        }
      }
      const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
      assert.equal('format' in pkg.scripts, features.prettier);
      assert.equal('lint' in pkg.scripts, features.eslint);
      assert.equal('lint-style' in pkg.scripts, features.stylelint);
      assert.equal('test' in pkg.scripts, features.tests);
      assert.equal('start' in pkg.scripts, features.storybook);
      assert.equal('prettier' in pkg.devDependencies, features.prettier);
      assert.equal('eslint' in pkg.devDependencies, features.eslint);
      assert.equal('stylelint' in pkg.devDependencies, features.stylelint);
      assert.equal('vitest' in pkg.devDependencies, features.tests);
      assert.equal('storybook' in pkg.devDependencies, features.storybook);
      assert.ok(existsSync(join(dir, 'tools/generators/component/index.js')));
      assert.ok(existsSync(join(dir, 'tools/generators/css/index.js')));
    }
  }
});

test('every feature combination renders valid files for exactly the chosen tools', () => {
  const keys = Object.keys(content.features);
  for (let mask = 0; mask < 1 << keys.length; mask++) {
    const features = Object.fromEntries(keys.map((key, index) => [key, Boolean(mask & (1 << index))]));
    const dir = tmp();
    scaffoldReactWorkspace({ cwd: dir, features });

    for (const file of readdirSync(dir, { recursive: true })) {
      if (statSync(join(dir, file)).isDirectory()) continue;
      const body = readFileSync(join(dir, file), 'utf8').toString();
      if (file.endsWith('.json')) JSON.parse(body);
      if (/^(package\.json|nx\.json|README\.md|tsconfig\.json|scripts\/viteConfig\.js)$/.test(file)) {
        assert.ok(!/\{\{[#^/]?\w+\}\}/.test(body), `${file} for ${JSON.stringify(features)}`);
      }
    }

    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
    const nx = JSON.parse(readFileSync(join(dir, 'nx.json'), 'utf8'));
    const project = JSON.parse(readFileSync(join(dir, 'project.json'), 'utf8'));
    assert.deepEqual(JSON.parse(readFileSync(join(dir, 'tateru.json'), 'utf8')), { framework: 'react', features });
    assert.equal(existsSync(join(dir, 'prettier.config.js')), features.prettier);
    assert.equal(existsSync(join(dir, '.prettierignore')), features.prettier);
    assert.equal('prettier' in pkg.devDependencies, features.prettier);
    assert.equal('format' in pkg.scripts, features.prettier);
    assert.equal('format' in project.targets, features.prettier);
    assert.equal(existsSync(join(dir, 'eslint.config.js')), features.eslint);
    assert.equal('eslint' in pkg.devDependencies, features.eslint);
    assert.equal('lint' in project.targets, features.eslint);
    assert.equal(existsSync(join(dir, 'stylelint.config.js')), features.stylelint);
    assert.equal('stylelint' in pkg.devDependencies, features.stylelint);
    assert.equal('lint-style' in pkg.scripts, features.stylelint);
    assert.equal(existsSync(join(dir, 'packages/Storybook')), features.storybook);
    assert.equal('storybook' in pkg.devDependencies, features.storybook);
    assert.equal(
      nx.plugins.some(({ plugin }) => plugin === '@nx/storybook/plugin'),
      features.storybook,
    );
    assert.equal(existsSync(join(dir, 'scripts/storybookConfig.js')), features.storybook);
    assert.equal(existsSync(join(dir, 'vite.config.js')), features.tests);
    assert.equal(existsSync(join(dir, 'scripts/vitest.config.js')), features.tests);
    assert.equal(existsSync(join(dir, 'scripts/vitestSetup.js')), features.tests);
    assert.equal('vitest' in pkg.devDependencies, features.tests);
    assert.equal('test' in project.targets, features.tests);
    assert.equal(existsSync(join(dir, 'scripts/viteConfig.test.js')), features.tests);
    assert.equal(readFileSync(join(dir, 'scripts/viteConfig.js'), 'utf8').includes('vitestSetup'), features.tests);
  }
});
