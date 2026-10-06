import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { describe, expect, it } from 'vitest';
import componentGenerator from './index.js';

describe('component generator', () => {
  it('creates a complete package with matching names', () => {
    const tree = createTreeWithEmptyWorkspace();
    tree.write('package.json', JSON.stringify({ name: '@example/root' }));
    componentGenerator(tree, { name: 'MyThing' });

    expect(
      tree
        .listChanges()
        .map(({ path }) => path)
        .filter((path) => path.startsWith('packages/MyThing/'))
        .sort(),
    ).toEqual(
      [
        'packages/MyThing/.storybook/main.mjs',
        'packages/MyThing/package.json',
        'packages/MyThing/project.json',
        'packages/MyThing/src/MyThing.jsx',
        'packages/MyThing/src/MyThing.css',
        'packages/MyThing/src/MyThing.stories.jsx',
        'packages/MyThing/src/MyThing.test.jsx',
        'packages/MyThing/src/index.js',
        'packages/MyThing/vite.config.mjs',
      ].sort(),
    );
    const packageJson = JSON.parse(tree.read('packages/MyThing/package.json', 'utf-8'));
    expect(packageJson.name).toBe('@example/my-thing');
    expect(packageJson.exports).toMatchObject({
      './*.css': './*.css',
    });
    expect(packageJson.files).toContain('*.css');
    expect(JSON.parse(tree.read('packages/MyThing/project.json', 'utf-8'))).toMatchObject({
      name: 'myThing',
      sourceRoot: 'packages/MyThing/src',
    });
    expect(tree.read('packages/MyThing/src/MyThing.jsx', 'utf-8')).toContain('className="my-thing"');
  });

  it('creates TypeScript sources and a declaration config', () => {
    const tree = createTreeWithEmptyWorkspace();
    tree.write('package.json', JSON.stringify({ name: '@example/root' }));
    componentGenerator(tree, { name: 'MyThing', language: 'typescript' });

    expect(
      tree
        .listChanges()
        .map(({ path }) => path)
        .filter((path) => path.startsWith('packages/MyThing/'))
        .sort(),
    ).toEqual(
      [
        'packages/MyThing/.storybook/main.mjs',
        'packages/MyThing/package.json',
        'packages/MyThing/project.json',
        'packages/MyThing/tsconfig.json',
        'packages/MyThing/src/MyThing.tsx',
        'packages/MyThing/src/MyThing.css',
        'packages/MyThing/src/MyThing.stories.tsx',
        'packages/MyThing/src/MyThing.test.tsx',
        'packages/MyThing/src/index.ts',
        'packages/MyThing/vite.config.mjs',
      ].sort(),
    );
    expect(tree.read('packages/MyThing/tsconfig.json', 'utf-8')).toContain('dist/packages/MyThing');
  });

  it('rejects an unknown language', () => {
    const tree = createTreeWithEmptyWorkspace();
    tree.write('package.json', JSON.stringify({ name: '@example/root' }));
    expect(() => componentGenerator(tree, { name: 'MyThing', language: 'cobol' })).toThrow(/Language/);
  });

  it('rejects invalid or existing component names', () => {
    const tree = createTreeWithEmptyWorkspace();
    expect(() => componentGenerator(tree, { name: 'bad-name' })).toThrow(/PascalCase/);
    componentGenerator(tree, { name: 'MyThing' });
    expect(() => componentGenerator(tree, { name: 'MyThing' })).toThrow(/already exists/);
  });
});
