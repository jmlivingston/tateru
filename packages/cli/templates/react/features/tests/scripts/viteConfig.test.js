import { join } from 'path';
import { pathToFileURL } from 'url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { componentPackage, createRepo, removeRepos, storybookPackage } from './testRepo.js';
import { createComponentViteConfig, createCssViteConfig } from './viteConfig.js';

afterEach(() => {
  removeRepos();
  vi.unstubAllEnvs();
});

function createLibraryRepo() {
  return createRepo({
    Button: componentPackage('Button', 'button', '@example/button'),
    MyThing: {
      ...componentPackage('MyThing', 'myThing', '@example/my-thing'),
      'package.json': {
        name: '@example/my-thing',
        peerDependencies: {
          '@example/button': '^0.0.1',
          react: '^19.0.0',
        },
      },
    },
    Storybook: storybookPackage(),
  });
}

function configFor(root, dir) {
  return createComponentViteConfig(pathToFileURL(join(root, 'packages', dir, 'vite.config.mjs')).href);
}

describe('createCssViteConfig', () => {
  it('builds every package stylesheet with its original name', () => {
    const root = createRepo({
      DesignTokens: {
        ...componentPackage('DesignTokens', 'designTokens', '@example/design-tokens'),
        'src/styles.css': ':root {}',
        'src/foo.css': '.foo {}',
      },
    });
    const config = createCssViteConfig(pathToFileURL(join(root, 'packages', 'DesignTokens', 'vite.config.mjs')).href);

    expect(config.build.cssCodeSplit).toBe(true);
    expect(config.build.lib.entry).toEqual({
      foo: join(root, 'packages/DesignTokens/src/foo.css'),
      styles: join(root, 'packages/DesignTokens/src/styles.css'),
    });
    expect(config.build.lib.formats).toEqual(['es']);
    expect(config.build.outDir).toBe(join(root, 'dist/packages/DesignTokens'));
  });
});

describe('createComponentViteConfig', () => {
  it('builds the package from its source entry into its dist directory', () => {
    const root = createLibraryRepo();
    const { build } = configFor(root, 'MyThing');

    expect(build.outDir).toBe(join(root, 'dist/packages/MyThing'));
    expect(build.lib.entry).toBe(join(root, 'packages/MyThing/src/index.js'));
    expect(build.lib.cssFileName).toBe('MyThing');
  });

  it('keeps peer dependencies and their subpaths out of the bundle', () => {
    const root = createLibraryRepo();
    const isExternal = configFor(root, 'MyThing').build.rolldownOptions.external;

    expect(isExternal('react')).toBe(true);
    expect(isExternal('react/jsx-runtime')).toBe(true);
    expect(isExternal('@example/button')).toBe(true);
    expect(isExternal('reactive')).toBe(false);
    expect(isExternal('./MyThing.css')).toBe(false);
  });

  it('aliases component packages to their source under Vitest', () => {
    const root = createLibraryRepo();
    expect(configFor(root, 'MyThing').resolve.alias).toEqual({
      '@example/button': join(root, 'packages/Button/src/index.js'),
      '@example/button/style.css': join(root, 'packages/Button/src/Button.css'),
      '@example/my-thing': join(root, 'packages/MyThing/src/index.js'),
      '@example/my-thing/style.css': join(root, 'packages/MyThing/src/MyThing.css'),
    });
  });

  it('aliases package stylesheet exports to their source CSS outside Vitest', () => {
    vi.stubEnv('VITEST', '');
    const root = createLibraryRepo();
    const { alias } = configFor(root, 'MyThing').resolve;

    expect(alias['@example/button/style.css']).toBe(join(root, 'packages/Button/src/Button.css'));
    expect(alias['@example/my-thing/style.css']).toBe(join(root, 'packages/MyThing/src/MyThing.css'));
  });

  it('leaves resolution alone outside Vitest', () => {
    vi.stubEnv('VITEST', '');
    const root = createLibraryRepo();
    const { alias } = configFor(root, 'MyThing').resolve;

    expect(alias).not.toHaveProperty('@example/my-thing');
  });
});
