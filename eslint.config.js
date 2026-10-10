import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import storybook from 'eslint-plugin-storybook';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    'dist',
    'storybook-static',
    'coverage',
    'skills',
    '.agents/skills',
    '.claude/skills',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'cn',
              message:
                "Import { cn } from '@/lib/utils' — it registers the custom typography sizes.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/lib/utils.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    // shadcn components export variants (e.g. buttonVariants) alongside components
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  storybook.configs['flat/recommended'],
]);
