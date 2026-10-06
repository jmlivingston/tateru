import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: ['../packages/**/*.stories.ts'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/angular',
    options: {
      builder: {
        name: '@storybook/builder-webpack5',
        options: {},
      },
    },
  },
};

export default config;
