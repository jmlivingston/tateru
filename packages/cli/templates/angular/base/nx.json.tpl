{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "sharedGlobals": [
{{#storybook}}
      "{workspaceRoot}/.storybook/**/*",
{{/storybook}}
      "{workspaceRoot}/scripts/**/*"
    ],
    "production": [
      "default",
      "!{projectRoot}/**/*.spec.ts",
      "!{projectRoot}/**/*.stories.ts"
    ]
  },
  "targetDefaults": {
    "build": {
      "cache": true,
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"]
    }
  },
  "release": {
    "projects": ["*", "!{{name}}"],
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
