import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { describe, expect, it } from 'vitest';
import componentGenerator from './index.js';

describe('Solid component generator', () => {
  it('creates a JavaScript package with Solid-aware Vite config', () => {
    const tree = createTreeWithEmptyWorkspace();
    tree.write('package.json', JSON.stringify({ name: '@example/root' }));
    componentGenerator(tree, { name: 'MyThing', language: 'javascript' });

    const paths = tree.listChanges().map(({ path }) => path).filter((path) => path.startsWith('packages/MyThing/'));
    expect(paths).toContain('packages/MyThing/src/MyThing.jsx');
    expect(paths).toContain('packages/MyThing/src/index.jsx');
    expect(paths).toContain('packages/MyThing/src/MyThing.test.jsx');
    expect(paths).not.toContain('packages/MyThing/tsconfig.build.json');
    expect(tree.read('packages/MyThing/vite.config.mjs', 'utf-8')).toContain('vite-plugin-solid');
    expect(JSON.parse(tree.read('packages/MyThing/package.json', 'utf-8')).peerDependencies).toHaveProperty('solid-js');
  });

  it('emits declaration configuration only for TypeScript and omits disabled features', () => {
    const tree = createTreeWithEmptyWorkspace();
    tree.write('package.json', JSON.stringify({ name: '@example/root' }));
    componentGenerator(tree, { name: 'TypedThing', language: 'typescript' });
    expect(tree.listChanges().map(({ path }) => path)).toContain(
      'packages/TypedThing/tsconfig.build.json',
    );
    expect(tree.read('packages/TypedThing/tsconfig.build.json', 'utf-8')).toContain('emitDeclarationOnly');

    const minimal = createTreeWithEmptyWorkspace();
    minimal.write('package.json', JSON.stringify({ name: '@example/root' }));
    minimal.write(
      'tateru.json',
      JSON.stringify({ features: { prettier: false, eslint: false, stylelint: false, storybook: false, tests: false } }),
    );
    componentGenerator(minimal, { name: 'PlainThing', language: 'javascript' });
    const paths = minimal.listChanges().map(({ path }) => path);
    expect(paths).not.toContain('packages/PlainThing/src/PlainThing.test.jsx');
    expect(minimal.read('packages/PlainThing/vite.config.mjs', 'utf-8')).not.toContain('vitest/config');
    expect(Object.keys(JSON.parse(minimal.read('packages/PlainThing/project.json', 'utf-8')).targets)).toEqual([
      'build',
    ]);
  });

  it('rejects invalid languages and duplicate names', () => {
    const tree = createTreeWithEmptyWorkspace();
    tree.write('package.json', JSON.stringify({ name: '@example/root' }));
    expect(() => componentGenerator(tree, { name: 'MyThing', language: 'cobol' })).toThrow(/Language/);
    expect(() => componentGenerator(tree, { name: 'bad-name' })).toThrow(/PascalCase/);
    componentGenerator(tree, { name: 'MyThing', language: 'javascript' });
    expect(() => componentGenerator(tree, { name: 'MyThing', language: 'javascript' })).toThrow(/already exists/);
  });
});
