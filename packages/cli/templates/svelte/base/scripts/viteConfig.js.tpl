import { svelte } from '@sveltejs/vite-plugin-svelte';
import { execFileSync } from 'child_process';
import { copyFileSync, readFileSync, readdirSync } from 'fs';
import { basename, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { findComponentPackage, listComponentPackages, listComponentStylesheetAliases } from './packageInfo.js';

export function createComponentViteConfig(packageUrl) {
  const packageDir = dirname(fileURLToPath(packageUrl));
  const root = resolve(packageDir, '../..');
  const pkg = findComponentPackage(basename(packageDir), { root });
  if (!pkg) throw new Error(`No component package found at ${packageDir}`);

  const packageJsonPath = resolve(packageDir, 'package.json');
  const peerDeps = Object.keys(JSON.parse(readFileSync(packageJsonPath, 'utf-8')).peerDependencies ?? {});
  const componentPackages = listComponentPackages({ root });

  return {
    plugins: [
      svelte({ configFile: resolve(root, 'svelte.config.js') }),
      {
        name: 'copy-library-metadata',
        closeBundle() {
          if (!process.env.VITEST && pkg.sourceEntry.endsWith('.ts')) {
            execFileSync(resolve(root, 'node_modules/.bin/svelte-check'), ['--tsconfig', resolve(root, 'tsconfig.json')], {
              cwd: root,
              stdio: 'inherit',
            });
          }
          copyFileSync(packageJsonPath, resolve(pkg.distDir, 'package.json'));
          copyFileSync(resolve(packageDir, 'src/index.d.ts'), resolve(pkg.distDir, 'index.d.ts'));
        },
      },
    ],
    build: {
      sourcemap: true,
      lib: {
        entry: pkg.sourceEntry,
        cssFileName: basename(packageDir),
        fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
        formats: ['es', 'cjs'],
      },
      rolldownOptions: {
        external: (id) => peerDeps.some((dep) => id === dep || id.startsWith(`${dep}/`)),
      },
      outDir: pkg.distDir,
      emptyOutDir: true,
    },
    resolve: {
      ...(process.env.VITEST ? { conditions: ['browser'] } : {}),
      alias: {
        ...listComponentStylesheetAliases({ root }),
        ...(process.env.VITEST
          ? Object.fromEntries(componentPackages.map(({ npmName, sourceEntry }) => [npmName, sourceEntry]))
          : {}),
      },
    },
{{#tests}}
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: [fileURLToPath(new URL('./vitestSetup.js', import.meta.url))],
      server: {
        deps: {
          inline: ['@testing-library/svelte', '@testing-library/svelte-core'],
        },
      },
    },
{{/tests}}
  };
}

export function createCssViteConfig(packageUrl) {
  const packageDir = dirname(fileURLToPath(packageUrl));
  const root = resolve(packageDir, '../..');
  const pkg = findComponentPackage(basename(packageDir), { root });
  if (!pkg) throw new Error(`No CSS package found at ${packageDir}`);

  const packageJson = resolve(packageDir, 'package.json');
  const stylesheetDir = dirname(pkg.sourceEntry);
  const stylesheetEntries = Object.fromEntries(
    readdirSync(stylesheetDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.css'))
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((entry) => [basename(entry.name, '.css'), resolve(stylesheetDir, entry.name)]),
  );
  if (Object.keys(stylesheetEntries).length === 0) {
    throw new Error(`CSS package ${basename(packageDir)} must contain CSS files in ${stylesheetDir}`);
  }

  return {
    plugins: [{
      name: 'copy-library-metadata',
      closeBundle() {
        copyFileSync(packageJson, resolve(pkg.distDir, 'package.json'));
      },
    }],
    build: {
      cssCodeSplit: true,
      lib: { entry: stylesheetEntries, formats: ['es'] },
      outDir: pkg.distDir,
      emptyOutDir: true,
    },
    resolve: { alias: listComponentStylesheetAliases({ root }) },
  };
}
