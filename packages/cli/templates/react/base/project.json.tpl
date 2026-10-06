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
{{#tests}}
    "lint": {
      "executor": "nx:run-commands",
      "options": {
        "command": "eslint --fix --cache --cache-location node_modules/.cache/eslint/ eslint.config.js vite.config.js scripts tools"
      }
    },
{{/tests}}
{{^tests}}
    "lint": {
      "executor": "nx:run-commands",
      "options": {
        "command": "eslint --fix --cache --cache-location node_modules/.cache/eslint/ eslint.config.js scripts tools"
      }
    },
{{/tests}}
{{/eslint}}
    "local-registry": {
      "options": {
        "port": 4873,

        "storage": "tmp/local-registry/storage"
      }
    }
  }
}
