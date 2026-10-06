import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { describe, expect, it } from 'vitest';
import cssGenerator from './index.js';

describe('Solid CSS generator', () => {
  it('creates a copyable stylesheet package', () => {
    const tree = createTreeWithEmptyWorkspace();
    tree.write('package.json', JSON.stringify({ name: '@example/root' }));
    cssGenerator(tree, { name: 'DesignTokens' });

    expect(
      tree.listChanges().map(({ path }) => path).filter((path) => path.startsWith('packages/DesignTokens/')).sort(),
    ).toEqual(
      [
        'packages/DesignTokens/package.json',
        'packages/DesignTokens/project.json',
        'packages/DesignTokens/src/styles.css',
        'packages/DesignTokens/vite.config.mjs',
      ].sort(),
    );
    expect(JSON.parse(tree.read('packages/DesignTokens/package.json', 'utf-8')).name).toBe(
      '@example/design-tokens',
    );
  });

  it('rejects invalid and duplicate names', () => {
    const tree = createTreeWithEmptyWorkspace();
    tree.write('package.json', JSON.stringify({ name: '@example/root' }));
    expect(() => cssGenerator(tree, { name: 'bad-name' })).toThrow(/PascalCase/);
    cssGenerator(tree, { name: 'DesignTokens' });
    expect(() => cssGenerator(tree, { name: 'DesignTokens' })).toThrow(/already exists/);
  });
});
