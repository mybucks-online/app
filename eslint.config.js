import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    ignores: ["dist", "dev-dist", ".eslintrc.cjs"],
  },
  ...compat.config({
    env: { browser: true, es2020: true },
    extends: [
      "eslint:recommended",
      "plugin:react/recommended",
      "plugin:react/jsx-runtime",
      "plugin:react-hooks/recommended",
    ],
    parserOptions: { ecmaVersion: "latest", sourceType: "module" },
    settings: { react: { version: "18.2" } },
    plugins: ["react", "react-hooks", "simple-import-sort", "import"],
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-no-target-blank": "off",
      "no-unused-vars": "warn",
      "react/prop-types": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "simple-import-sort/imports": [
        "error",
        {
          groups: [["^react", "^@?\\w"], ["^@mybucks/"], ["^\\.", "^[^.]"]],
        },
      ],
      "simple-import-sort/exports": "error",
      "comma-spacing": ["error", { before: false, after: true }],
    },
  }),
  {
    files: ["vite.config.js", "eslint.config.js"],
    languageOptions: {
      globals: {
        process: "readonly",
      },
    },
  },
];
