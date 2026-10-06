import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { describe, expect, it } from 'vitest';
import componentGenerator from './index.js';

describe('Angular component generator', () => {
  it('creates a publishable TypeScript library with enabled features', () => {
    const tree = createTreeWithEmptyWorkspace();
    tree.write('package.json', JSON.stringify({ name: '@example/root' }));
    componentGenerator(tree, { name: 'MyThing', language: 'typescript' });

    expect(
      tree.listChanges().map(({ path }) => path).filter((path) => path.startsWith('packages/MyThing/')).sort(),
    ).toEqual(
      [
        'packages/MyThing/ng-package.json',
        'packages/MyThing/package.json',
        'packages/MyThing/project.json',
        'packages/MyThing/src/MyThing.component.css',
        'packages/MyThing/src/MyThing.component.spec.ts',
        'packages/MyThing/src/MyThing.component.stories.ts',
        'packages/MyThing/src/MyThing.component.ts',
        'packages/MyThing/src/index.ts',
        'packages/MyThing/tsconfig.lib.json',
        'packages/MyThing/tsconfig.spec.json',
        'packages/MyThing/vite.config.mjs',
      ].sort(),
    );
    expect(JSON.parse(tree.read('packages/MyThing/package.json', 'utf-8')).name).toBe('@example/my-thing');
    expect(JSON.parse(tree.read('packages/MyThing/project.json', 'utf-8')).targets).toHaveProperty('build');
    expect(tree.read('packages/MyThing/ng-package.json', 'utf-8')).toContain('dist/packages/MyThing');
  });

  it('omits disabled feature files and targets', () => {
    const tree = createTreeWithEmptyWorkspace();
    tree.write('package.json', JSON.stringify({ name: '@example/root' }));
    tree.write(
      'tateru.json',
      JSON.stringify({ features: { prettier: false, eslint: false, stylelint: false, storybook: false, tests: false } }),
    );
    componentGenerator(tree, { name: 'MyThing', language: 'typescript' });

    const paths = tree.listChanges().map(({ path }) => path);
    expect(paths).not.toContain('packages/MyThing/src/MyThing.component.spec.ts');
    expect(paths).not.toContain('packages/MyThing/src/MyThing.component.stories.ts');
    expect(paths).not.toContain('packages/MyThing/vite.config.mjs');
    expect(Object.keys(JSON.parse(tree.read('packages/MyThing/project.json', 'utf-8')).targets)).toEqual(['build']);
  });

  it('rejects JavaScript and invalid or duplicate component names', () => {
    const tree = createTreeWithEmptyWorkspace();
    tree.write('package.json', JSON.stringify({ name: '@example/root' }));
    expect(() => componentGenerator(tree, { name: 'MyThing', language: 'javascript' })).toThrow(/TypeScript/);
    expect(() => componentGenerator(tree, { name: 'bad-name' })).toThrow(/PascalCase/);
    componentGenerator(tree, { name: 'MyThing', language: 'typescript' });
    expect(() => componentGenerator(tree, { name: 'MyThing', language: 'typescript' })).toThrow(/already exists/);
  });
});
