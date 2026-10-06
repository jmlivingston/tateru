import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'url';
import { listComponentPackages, listComponentStylesheetAliases } from './packageInfo.js';

export const sharedStorybookConfig = {
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/svelte-vite',
    options: { docgen: false },
  },
  async viteFinal(config) {
    return {
      ...config,
      plugins: [
        ...(config.plugins ?? []),
        svelte({ configFile: fileURLToPath(new URL('../svelte.config.js', import.meta.url)) }),
      ],
      build: {
        ...config.build,
        chunkSizeWarningLimit: 1500,
      },
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          ...listComponentStylesheetAliases(),
          ...Object.fromEntries(listComponentPackages().map(({ npmName, sourceEntry }) => [npmName, sourceEntry])),
        },
      },
    };
  },
};

export function createComponentStorybookConfig(stories) {
  return { stories, ...sharedStorybookConfig };
}
