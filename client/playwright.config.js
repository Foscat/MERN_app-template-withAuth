/**
 * @module client/playwright.config
 * @description Playwright visual-regression configuration for public application routes.
 */

const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./playwright/pages",
  timeout: 30_000,
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      scale: "css",
    },
  },
  reporter: "list",
  fullyParallel: false,
  use: {
    browserName: "chromium",
    baseURL: "http://127.0.0.1:4173",
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    timezoneId: "America/Chicago",
  },
  webServer: {
    command: "node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
