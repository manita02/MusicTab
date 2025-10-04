const eslintPluginImport = require("eslint-plugin-import");
const eslintPluginSimpleImportSort = require("eslint-plugin-simple-import-sort");
const prettierConfig = require("eslint-config-prettier");

module.exports = [
  {
    files: ["**/*.ts"],
    ignores: ["dist", "node_modules", ".yarn"],
    languageOptions: {
      parserOptions: {
        project: [
          "./tsconfig.json",
          "./apps/backend/tsconfig.json",
          "./domain/tsconfig.json",
        ],
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      import: eslintPluginImport,
      "simple-import-sort": eslintPluginSimpleImportSort,
    },
    rules: {
      ...prettierConfig.rules,
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
];