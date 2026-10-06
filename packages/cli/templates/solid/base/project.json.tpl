{
  "name": "{{name}}",
  "$schema": "node_modules/nx/schemas/project-schema.json",
  "targets": {
{{#prettier}}
    "format": {
      "executor": "nx:run-commands",
      "options": {
        "command": "prettier --write ."
      }
    },
{{/prettier}}
{{#tests}}
    "test": {
      "executor": "nx:run-commands",
      "options": {
        "command": "vitest run --project scripts"
      }
    },
{{/tests}}
{{#eslint}}
    "lint": {
      "executor": "nx:run-commands",
      "options": {
        "command": "eslint --fix --cache --cache-location node_modules/.cache/eslint/ eslint.config.js tools scripts"
      }
    },
{{/eslint}}
    "local-registry": {
      "options": {
        "port": 4873,
        "storage": "tmp/local-registry/storage"
      }
    }
  }
}
