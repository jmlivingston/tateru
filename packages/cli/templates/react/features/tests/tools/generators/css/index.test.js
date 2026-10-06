import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { describe, expect, it } from 'vitest';
import cssGenerator from './index.js';

describe('CSS package generator', () => {
  it('creates a buildable package with a stylesheet export', () => {
    const tree = createTreeWithEmptyWorkspace();
    tree.write('package.json', JSON.stringify({ name: '@example/root' }));
    cssGenerator(tree, { name: 'DesignTokens' });

    expect(
      tree
        .listChanges()
        .map(({ path }) => path)
        .filter((path) => path.startsWith('packages/DesignTokens/'))
        .sort(),
    ).toEqual(
      [
        'packages/DesignTokens/package.json',
        'packages/DesignTokens/project.json',
        'packages/DesignTokens/src/styles.css',
        'packages/DesignTokens/vite.config.mjs',
      ].sort(),
    );

    const packageJson = JSON.parse(tree.read('packages/DesignTokens/package.json', 'utf-8'));
    expect(packageJson.name).toBe('@example/design-tokens');
    expect(packageJson.exports).toEqual({
      '.': './styles.css',
      './style.css': './styles.css',
      './*.css': './*.css',
    });
    expect(packageJson.files).toEqual(['*.css']);
    expect(tree.read('packages/DesignTokens/vite.config.mjs', 'utf-8')).toContain('createCssViteConfig');
    expect(tree.read('packages/DesignTokens/project.json', 'utf-8')).toContain('packages/DesignTokens/src');
  });

  it('rejects invalid or existing CSS package names', () => {
    const tree = createTreeWithEmptyWorkspace();
    expect(() => cssGenerator(tree, { name: 'bad-name' })).toThrow(/PascalCase/);
    cssGenerator(tree, { name: 'DesignTokens' });
    expect(() => cssGenerator(tree, { name: 'DesignTokens' })).toThrow(/already exists/);
  });
});
