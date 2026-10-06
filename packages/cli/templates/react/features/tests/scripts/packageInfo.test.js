import { join } from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { findComponentPackage, listComponentPackages, listComponentStylesheetAliases } from './packageInfo.js';
import { componentPackage, createRepo, removeRepos, storybookPackage } from './testRepo.js';

afterEach(removeRepos);

describe('listComponentPackages', () => {
  it('uses a TypeScript entry when the package has one', () => {
    const root = createRepo({
      Button: { ...componentPackage('Button', 'button', '@example/button'), 'src/index.ts': '' },
      Card: componentPackage('Card', 'card', '@example/card'),
    });

    expect(listComponentPackages({ root }).map(({ sourceEntry }) => sourceEntry)).toEqual([
      join(root, 'packages/Button/src/index.ts'),
      join(root, 'packages/Card/src/index.js'),
    ]);
  });

  it('lists component packages with their identities and excludes Storybook', () => {
    const root = createRepo({
      Button: componentPackage('Button', 'button', '@example/button'),
      MyThing: componentPackage('MyThing', 'myThing', '@example/my-thing'),
      Storybook: storybookPackage(),
    });

    expect(listComponentPackages({ root })).toEqual([
      {
        dir: 'Button',
        projectName: 'button',
        npmName: '@example/button',
        sourceEntry: join(root, 'packages/Button/src/index.js'),
        distDir: join(root, 'dist/packages/Button'),
      },
      {
        dir: 'MyThing',
        projectName: 'myThing',
        npmName: '@example/my-thing',
        sourceEntry: join(root, 'packages/MyThing/src/index.js'),
        distDir: join(root, 'dist/packages/MyThing'),
      },
    ]);
  });

  it('fails naming the package when package.json is missing', () => {
    const root = createRepo({
      Button: {
        'project.json': componentPackage('Button', 'button', 'x')['project.json'],
      },
    });

    expect(() => listComponentPackages({ root })).toThrow(/Button.*package\.json/);
  });

  it('fails naming the package when project.json is invalid', () => {
    const root = createRepo({
      Button: {
        ...componentPackage('Button', 'button', 'x'),
        'project.json': '{ not json',
      },
    });

    expect(() => listComponentPackages({ root })).toThrow(/Button.*project\.json/);
  });
});

describe('findComponentPackage', () => {
  function createMyThingRepo() {
    return createRepo({
      MyThing: componentPackage('MyThing', 'myThing', '@example/my-thing'),
      Storybook: storybookPackage(),
    });
  }

  it.each(['MyThing', 'mything', 'MYTHING', 'myThing', 'my-thing', 'My-Thing', '@example/my-thing'])(
    'finds the package by %s',
    (input) => {
      const root = createMyThingRepo();
      expect(findComponentPackage(input, { root })?.dir).toBe('MyThing');
    },
  );

  it('returns null for an unknown name', () => {
    const root = createMyThingRepo();
    expect(findComponentPackage('XyzAbc', { root })).toBeNull();
  });

  it('does not find Storybook', () => {
    const root = createMyThingRepo();
    expect(findComponentPackage('Storybook', { root })).toBeNull();
  });
});

describe('listComponentStylesheetAliases', () => {
  it('maps each package style export to its source stylesheet', () => {
    const root = createRepo({
      Button: componentPackage('Button', 'button', '@example/button'),
      Css: {
        ...componentPackage('Css', 'css', '@example/css'),
        'package.json': {
          name: '@example/css',
          exports: { '.': './styles.css' },
        },
        'src/styles.css': ':root {}',
        'src/foo.css': '.foo {}',
      },
      Storybook: storybookPackage(),
    });

    expect(listComponentStylesheetAliases({ root })).toEqual({
      '@example/button/style.css': join(root, 'packages/Button/src/Button.css'),
      '@example/css/style.css': join(root, 'packages/Css/src/styles.css'),
      '@example/css/styles.css': join(root, 'packages/Css/src/styles.css'),
      '@example/css/foo.css': join(root, 'packages/Css/src/foo.css'),
    });
  });
});
