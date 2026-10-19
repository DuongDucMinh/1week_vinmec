import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'outputs/playwright-report' }]],
  outputDir: 'outputs/browser-artifacts',
  use: { baseURL: 'http://127.0.0.1:3101', channel: 'chrome', headless: true, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: { command: 'node --import tsx src/server/index.ts', url: 'http://127.0.0.1:3101/api/health', reuseExistingServer: !process.env.CI, timeout: 90000, env: { PORT: '3101', HOST: '127.0.0.1', DATABASE_PATH: 'data/e2e-demo.sqlite' } },
});
