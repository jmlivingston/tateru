/**
 * Shared Storybook configuration
 * This config is used across all component-specific and centralized Storybook instances
 */

import { listComponentPackages, listComponentStylesheetAliases } from './packageInfo.js';

export const sharedStorybookConfig = {
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
  },
  async viteFinal(config) {
    return {
      ...config,
      build: {
        ...config.build,
        // Storybook's own preview and docs bundles are ~1 MB; component code is a tiny fraction of that.
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

/**
 * Create a Storybook config for a single component
 * @param {string[]} stories - Array of story glob patterns
 * @returns {Object} Storybook configuration
 */
export function createComponentStorybookConfig(stories) {
  return {
    stories,
    ...sharedStorybookConfig,
  };
}
