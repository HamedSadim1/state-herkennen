import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Root config files (eslint.config.js, commitlint.config.js) are intentionally
  // not linted; linting is scoped to the TypeScript/React source in src/.
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // Enforce the "@/" path alias: relative parent imports ("../") are an
      // error so every module is addressed through the src-root alias.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../**"],
              message:
                'Relative parent imports are not allowed; use the "@/" alias instead.',
            },
          ],
        },
      ],
      // Enforce the cn() utility: a className whose value is directly a
      // template literal (e.g. `className={`a ${x}`}`) is an error. Templates
      // nested inside cn(...) arguments stay allowed.
      "no-restricted-syntax": [
        "error",
        {
          selector:
            'JSXAttribute[name.name="className"] > JSXExpressionContainer > TemplateLiteral',
          message:
            "Template-literal class names are not allowed; use the cn() utility instead.",
        },
      ],
    },
  }
);
