import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import hooksPlugin from 'eslint-plugin-react-hooks';
import unusedImports from "eslint-plugin-unused-imports";

export default [
  {
    ignores: [
      "dist/",
      "node_modules/",
      "*.d.ts",
      "node_modules/",
      "**/build/**/",
      "packages/theme/dist/",
      "tmp/",
      "*.min.js",
      "coverage/",
      "**/.docusaurus/",
      "**/dist/",
      "**/build/",
      "**/node_modules/",
    ]
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: pluginReact,
      'react-hooks': hooksPlugin,
      '@typescript-eslint': tseslint.plugin,
      "unused-imports": unusedImports,    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      "no-unused-vars": "off", // or "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          "vars": "all",
          "varsIgnorePattern": "^_",
          "args": "after-used",
          "argsIgnorePattern": "^_",
        }
      ]

    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
