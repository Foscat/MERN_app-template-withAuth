const { test, expect } = require("@playwright/test");

const PAGES = [
  { route: "/", snapshotName: "home-page.png" },
  { route: "/login", snapshotName: "login-page.png" },
  { route: "/register", snapshotName: "register-page.png" },
];

for (const { route, snapshotName } of PAGES) {
  test(`visual snapshot: ${route}`, async ({ page }) => {
    await page.goto(route, { waitUntil: "networkidle" });
    await expect(page).toHaveScreenshot(snapshotName, { fullPage: true });
  });
}
