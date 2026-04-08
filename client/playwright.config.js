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
    colorScheme: "light",
    timezoneId: "America/Chicago",
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
