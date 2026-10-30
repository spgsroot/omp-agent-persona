// PROTECTED. ESLint flat config (ESLint 9.22+ / 10) with typescript-eslint type-aware rules.
// npm i -D eslint @eslint/js typescript-eslint
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  { ignores: ["dist/**", "build/**", "coverage/**", "node_modules/**", "**/*.gen.ts"] },
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      // --- extensibility: small, flat, explicit units
      complexity: ["error", 10],
      "max-depth": ["error", 3],
      "max-params": ["error", 4],
      "max-lines-per-function": ["error", { max: 60, skipBlankLines: true, skipComments: true }],
      "max-lines": ["error", { max: 400, skipBlankLines: true, skipComments: true }],
      "no-restricted-syntax": ["error", { selector: "TSEnumDeclaration", message: "Use a union of string literals." }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/ban-ts-comment": ["error", { "ts-expect-error": "allow-with-description", minimumDescriptionLength: 10 }],
      // --- correctness in async code (streams, providers, queues)
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/return-await": ["error", "in-try-catch"],
      // --- performance
      "no-await-in-loop": "error",            // use Promise.all / bounded concurrency
      "@typescript-eslint/prefer-for-of": "error",
      "@typescript-eslint/prefer-includes": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
  {
    files: ["**/*.test.ts", "**/*.spec.ts", "benches/**"],
    rules: {
      "max-lines-per-function": "off",
      "max-lines": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "no-await-in-loop": "off",
      "no-console": "off",
    },
  },
  { files: ["**/*.js", "**/*.mjs", "**/*.cjs"], extends: [tseslint.configs.disableTypeChecked] },
);
