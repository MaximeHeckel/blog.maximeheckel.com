/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // @ts-ignore
  plugins: [react(), tsconfigPaths()],
  test: {
    include: ['./**/*.spec.ts', './**/*.spec.tsx'],
    exclude: ['node_modules', '.next', 'cypress'],
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest-setup.ts'],
    pool: 'forks',
  },
});
