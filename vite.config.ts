/// <reference types="vitest/config" />
import path from 'node:path';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import Unfonts from 'unplugin-fonts/vite';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import { svgrOptions } from './svgr.config.ts';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // `import Icon from './icon.svg?react'` → React component (see svgr.config.ts).
    svgr({ svgrOptions }),
    Unfonts({
      fontsource: {
        families: ['Noto Sans Variable', 'Noto Sans SC Variable', 'Noto Sans TC Variable'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    assetsInlineLimit(filePath) {
      if (/\.(?:woff2?|ttf|otf|eot)$/i.test(filePath)) return false;
    },
    rolldownOptions: {
      output: {
        assetFileNames(assetInfo) {
          const name = assetInfo.names[0] ?? '';
          if (/\.(?:woff2?|ttf|otf|eot)$/i.test(name)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  test: {
    projects: [
      {
        extends: true,
        // Runs every story as a test (render + play function + a11y checks).
        // https://storybook.js.org/docs/writing-tests/integrations/vitest-addon
        plugins: [storybookTest({ configDir: path.join(import.meta.dirname, '.storybook') })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
