module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  settings: { react: { version: "18.2" } },
  plugins: [
    "react-refresh",
    "react",
    "react-hooks",
    "simple-import-sort",
    "import",
  ],
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/jsx-no-target-blank": "off",
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "no-unused-vars": "warn",
    "react/prop-types": "off",
    "simple-import-sort/imports": [
      "error",
      {
        groups: [["^react", "^@?\\w"], ["^@mybucks/"], ["^\\.", "^[^.]"]],
      },
    ],
    "simple-import-sort/exports": "error",
    "comma-spacing": ["error", { before: false, after: true }],
  },
};
