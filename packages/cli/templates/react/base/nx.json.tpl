{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "plugins": [
{{#storybook}}
    {
      "plugin": "@nx/storybook/plugin",
      "options": {
        "serveStorybookTargetName": "storybook",
        "buildStorybookTargetName": "build-storybook",
        "staticStorybookTargetName": "static-storybook",
        "testStorybookTargetName": "test-storybook"
      }
    },
{{/storybook}}
    {
      "plugin": "@nx/vite/plugin",
      "options": {
        "buildTargetName": "build",
        "testTargetName": "test",
        "serveTargetName": "serve",
        "devTargetName": "dev",
        "previewTargetName": "preview",
        "serveStaticTargetName": "serve-static",
        "typecheckTargetName": "typecheck",
        "buildDepsTargetName": "build-deps",
        "watchDepsTargetName": "watch-deps"
      }
    }
  ],
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "sharedGlobals": [
{{#storybook}}
      "{workspaceRoot}/scripts/storybookConfig.js",
{{/storybook}}
      "{workspaceRoot}/scripts/packageInfo.js",
      "{workspaceRoot}/scripts/viteConfig.js"
    ],
    "production": [
      "default",
      "!{projectRoot}/**/*.test.{jsx,tsx}",
      "!{projectRoot}/**/*.stories.{jsx,tsx}",
      "!{projectRoot}/.storybook/**/*"
    ]
  },
  "targetDefaults": {
    "nx-release-publish": {
      "options": {
        "packageRoot": "dist/{projectRoot}"
      }
    }
  },
  "release": {
{{#storybook}}
    "projects": ["*", "!{{name}}", "!storybook"],
{{/storybook}}
{{^storybook}}
    "projects": ["*", "!{{name}}"],
{{/storybook}}
    "version": {
      "preVersionCommand": "npx nx run-many -t build",
      "manifestRootsToUpdate": ["dist/{projectRoot}"],
      "currentVersionResolver": "git-tag",
      "fallbackCurrentVersionResolver": "disk",
      "preserveMatchingDependencyRanges": false
    }
  },
  "analytics": false
}
