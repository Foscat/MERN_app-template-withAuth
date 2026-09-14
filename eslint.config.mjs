/**
 * @module eslint.config
 * @description Flat ESLint configuration for server, scripts, and repository tests.
 */

import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["client/**", "docs/**", "node_modules/**"],
  },
  {
    files: ["app/**/*.js"],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.node,
      sourceType: "commonjs",
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["scripts/**/*.mjs", "shared/**/*.mjs"],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.node,
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
];
