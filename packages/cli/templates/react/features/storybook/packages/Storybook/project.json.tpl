{
  "name": "storybook",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "packages/Storybook",
  "projectType": "application",
  "tags": [],
  "implicitDependencies": ["*", "!{{name}}"],
  "targets": {
{{#prettier}}
    "format": {
      "executor": "nx:run-commands",
      "options": {
        "command": "prettier --write \"**/*.{js,jsx,mjs,json,md,scss}\"",
        "cwd": "packages/Storybook"
      }
    },
{{/prettier}}
    "start": {
      "executor": "nx:run-commands",
      "options": {
        "command": "storybook dev --port 4000",
        "cwd": "packages/Storybook"
      }
    },
    "build": {
      "executor": "nx:run-commands",
      "cache": true,
      "inputs": ["default", "^default", { "externalDependencies": ["storybook"] }],
      "outputs": ["{workspaceRoot}/dist/packages/Storybook"],
      "options": {
        "command": "storybook build --output-dir ../../dist/packages/Storybook",
        "cwd": "packages/Storybook"
      }
    }
  }
}
