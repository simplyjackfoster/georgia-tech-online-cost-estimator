import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const fallbackBase = '/';
  const base =
    env.VITE_BASE ||
    env.PUBLIC_URL ||
    (env.VITE_GITHUB_PAGES === 'true' ? env.VITE_GITHUB_PAGES_BASE : '') ||
    fallbackBase;

  return {
    base,
    plugins: [react()],
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
      include: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
      exclude: ['e2e/**', 'node_modules/**']
    }
  };
});
