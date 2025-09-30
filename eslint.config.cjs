const eslintPluginImport = require("eslint-plugin-import");
const eslintPluginSimpleImportSort = require("eslint-plugin-simple-import-sort");
const prettierConfig = require("eslint-config-prettier");

module.exports = [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: { project: "./tsconfig.json" },
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
