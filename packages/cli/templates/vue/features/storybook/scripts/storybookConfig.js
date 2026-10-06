import vue from '@vitejs/plugin-vue';
import { listComponentPackages, listComponentStylesheetAliases } from './packageInfo.js';

export const sharedStorybookConfig = {
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/vue3-vite',
  },
  async viteFinal(config) {
    return {
      ...config,
      plugins: [...(config.plugins ?? []), vue()],
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
