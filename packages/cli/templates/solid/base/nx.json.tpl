{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
{{#storybook}}
  "plugins": [
    {
      "plugin": "@nx/storybook/plugin",
      "options": {
        "serveStorybookTargetName": "storybook",
        "buildStorybookTargetName": "build-storybook",
        "staticStorybookTargetName": "static-storybook",
        "testStorybookTargetName": "test-storybook"
      }
    }
  ],
{{/storybook}}
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "sharedGlobals": ["{workspaceRoot}/scripts/**/*"],
    "production": [
      "default",
      "!{projectRoot}/**/*.test.{jsx,tsx}",
      "!{projectRoot}/**/*.stories.{jsx,tsx}",
      "!{projectRoot}/.storybook/**/*"
    ]
  },
  "targetDefaults": {
    "build": {
      "cache": true,
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"]
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
