{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "packages",
  "projects": {
    "storybook": {
      "projectType": "application",
      "root": "packages/storybook",
      "sourceRoot": "packages/storybook/src",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            "outputPath": "dist/storybook-browser",
            "index": "packages/storybook/src/index.html",
            "main": "packages/storybook/src/main.ts",
            "polyfills": ["zone.js"],
            "tsConfig": "packages/storybook/tsconfig.app.json",
            "assets": [],
            "styles": [],
            "scripts": []
          },
          "configurations": {
            "production": {
              "outputHashing": "none"
            }
          }
        },
        "storybook": {
          "builder": "@storybook/angular:start-storybook",
          "options": {
            "configDir": ".storybook",
            "browserTarget": "storybook:build",
            "tsConfig": "packages/storybook/tsconfig.app.json",
            "compodoc": false,
            "port": 6006
          }
        },
        "build-storybook": {
          "builder": "@storybook/angular:build-storybook",
          "options": {
            "configDir": ".storybook",
            "browserTarget": "storybook:build",
            "tsConfig": "packages/storybook/tsconfig.app.json",
            "compodoc": false,
            "outputDir": "dist/storybook"
          }
        }
      }
    }
  }
}
