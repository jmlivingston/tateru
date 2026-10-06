import react from '@vitejs/plugin-react';
import { execFileSync } from 'child_process';
import { copyFileSync, existsSync, readFileSync, readdirSync } from 'fs';
import { createRequire } from 'module';
import { basename, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { findComponentPackage, listComponentPackages, listComponentStylesheetAliases } from './packageInfo.js';

/**
 * Create the Vite config for a component package
 * @param {string} packageUrl - import.meta.url of the calling vite.config.mjs
 */
export function createComponentViteConfig(packageUrl) {
  const packageDir = dirname(fileURLToPath(packageUrl));
  const root = resolve(packageDir, '../..');
  const pkg = findComponentPackage(basename(packageDir), { root });
  if (!pkg) {
    throw new Error(`No component package found at ${packageDir}`);
  }
  const packageJson = JSON.parse(readFileSync(resolve(packageDir, 'package.json'), 'utf-8'));
  const peerDeps = Object.keys(packageJson.peerDependencies ?? {});
  const componentPackages = listComponentPackages({ root });
  const sourceAliases = Object.fromEntries(componentPackages.map((p) => [p.npmName, p.sourceEntry]));
  const stylesheetAliases = listComponentStylesheetAliases({ root });

  return {
    plugins: [
      react(),
      {
        name: 'copy-package-json',
        closeBundle() {
          copyFileSync(resolve(packageDir, 'package.json'), resolve(pkg.distDir, 'package.json'));
        },
      },
      {
        name: 'emit-types',
        closeBundle() {
          const tsconfig = resolve(packageDir, 'tsconfig.json');
          if (!existsSync(tsconfig)) return;
          const tsc = createRequire(import.meta.url).resolve('typescript/bin/tsc');
          execFileSync(process.execPath, [tsc, '--project', tsconfig], { stdio: 'inherit' });
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
        // Subpaths such as react/jsx-runtime must stay external too, or React gets bundled.
        external: (id) => peerDeps.some((dep) => id === dep || id.startsWith(`${dep}/`)),
      },
      outDir: pkg.distDir,
      emptyOutDir: true,
    },
    // Resolve package styles locally; alias JS package entries only for tests.
    resolve: {
      alias: {
        ...stylesheetAliases,
        ...(process.env.VITEST ? sourceAliases : {}),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: [fileURLToPath(new URL('./vitestSetup.js', import.meta.url))],
    },
  };
}

export function createCssViteConfig(packageUrl) {
  const packageDir = dirname(fileURLToPath(packageUrl));
  const root = resolve(packageDir, '../..');
  const pkg = findComponentPackage(basename(packageDir), { root });
  if (!pkg) {
    throw new Error(`No CSS package found at ${packageDir}`);
  }

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
    plugins: [
      {
        name: 'copy-package-json',
        closeBundle() {
          copyFileSync(packageJson, resolve(pkg.distDir, 'package.json'));
        },
      },
    ],
    build: {
      cssCodeSplit: true,
      lib: {
        entry: stylesheetEntries,
        formats: ['es'],
      },
      outDir: pkg.distDir,
      emptyOutDir: true,
    },
    resolve: {
      alias: listComponentStylesheetAliases({ root }),
    },
  };
}
