import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isGithubPages = env.GITHUB_PAGES === 'true';
  const isVercel = env.VERCEL === '1';
  const base =
    env.VITE_BASE ||
    env.GITHUB_PAGES_BASE ||
    (isGithubPages && !isVercel ? '/georgia-tech-online-cost-estimator/' : '/');

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
