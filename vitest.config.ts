/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import path, { resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  // @ts-ignore
  plugins: [react()],
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'core'),
      lib: resolve(__dirname, './lib'),
      styles: resolve(__dirname, './styles'),
    },
  },
  test: {
    include: ['./**/*.spec.ts', './**/*.spec.tsx'],
    exclude: ['node_modules', '.next', 'cypress'],
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest-setup.ts'],
    pool: 'forks',
  },
});
