import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import typescript from "typescript-eslint";

/** @type {import("eslint").Linter.Config[]} */
export default [
  js.configs.recommended,
  ...typescript.configs.recommended,
  {
    ...react.configs.flat.recommended,
    ...react.configs.flat["jsx-runtime"], // Required for React 17+
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      camelcase: [
        "error",
        {
          properties: "never",
        },
      ],
      eqeqeq: "error",
      "lines-between-class-members": "off",
      "no-console": "warn",
      "no-unreachable-loop": "error",
      "no-unused-vars": "off",
      "no-self-compare": "error",
      "prefer-promise-reject-errors": "error",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_\\$",
          varsIgnorePattern: "^_\\$",
        },
      ],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },
  {
    ignores: [
      "vendor",
      "node_modules",
      "public",
      "bootstrap/ssr",
      "tailwind.config.js",
    ],
  },
  prettier, // Turn off all rules that might conflict with Prettier
];
