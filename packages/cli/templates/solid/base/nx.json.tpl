{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "sharedGlobals": ["{workspaceRoot}/scripts/**/*"],
    "production": [
      "default",
      "!{projectRoot}/**/*.test.{jsx,tsx}"
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
