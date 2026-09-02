import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

/**
 * Flat config (ESLint 9).
 *
 * The rules that actually earn their place here are `react-hooks/*`: the
 * redirect loop in RequireAuth was an unstable value in an effect dependency
 * array, which is exactly what exhaustive-deps catches. Everything else is
 * kept close to the recommended sets so the signal stays high.
 */
export default [
  {
    ignores: ["dist/**", "node_modules/**", "src/mocks/**"],
  },

  js.configs.recommended,

  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.es2021 },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: { react: { version: "detect" } },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat["jsx-runtime"].rules,
      ...reactHooks.configs["recommended-latest"].rules,

      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // props are documented in JSDoc headers rather than PropTypes
      "react/prop-types": "off",

      // an unused caught error is idiomatic here: several handlers deliberately
      // swallow one and fall through to a rendered error state
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],
    },
  },

  {
    // the mock is dev scaffolding, and Node-flavoured in places
    files: ["src/mocks/**/*.js"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },

  {
    // build config runs in Node, not the browser
    files: ["vite.config.js", "eslint.config.js"],
    languageOptions: { globals: globals.node },
  },
];
