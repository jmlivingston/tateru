{
  "name": "{{name}}",
  "$schema": "node_modules/nx/schemas/project-schema.json",
  "targets": {
    "format": {
      "executor": "nx:run-commands",
      "options": {
        "command": "prettier --write ."
      }
    },
    "test": {
      "executor": "nx:run-commands",
      "options": {
        "command": "vitest run --project scripts"
      }
    },
    "lint": {
      "executor": "nx:run-commands",
      "options": {
        "command": "eslint --fix --cache --cache-location node_modules/.cache/eslint/ eslint.config.js vite.config.js scripts tools"
      }
    },
    "local-registry": {
      "options": {
        "port": 4873,

        "storage": "tmp/local-registry/storage"
      }
    }
  }
}
