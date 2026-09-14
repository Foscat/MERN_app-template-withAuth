/**
 * @module client/playwright/pages/app.smoke.spec
 * @description Cross-route browser smoke tests for the public application shell.
 */

const { expect, test } = require("@playwright/test");

const PUBLIC_ROUTES = [
  {
    route: "/",
    heading: "A secure MERN starting point, shaped for real product work.",
  },
  { route: "/login", heading: "Login" },
  { route: "/register", heading: "Register" },
];

for (const { route, heading } of PUBLIC_ROUTES) {
  test(`public route renders: ${route}`, async ({ page }) => {
    await page.route("**/api/users/refresh", (requestRoute) =>
      requestRoute.fulfill({
        body: JSON.stringify({ message: "No refresh token" }),
        contentType: "application/json",
        status: 401,
      }),
    );
    await page.goto(route);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    const config = await page.evaluate(async () => {
      const { default: siteConfig } = await import("/src/config/site.js");
      return siteConfig;
    });
    const shell = page.locator(".ly-root.ly-page");
    await expect(shell).toHaveAttribute("data-ui", config.style);
    await expect(shell).toHaveAttribute("data-ly-layout", config.style);
    if (config.theme) {
      await expect(shell).toHaveAttribute("data-theme", config.theme);
    } else {
      await expect(shell).not.toHaveAttribute("data-theme");
    }
    await expect(shell).toHaveAttribute(
      "data-mode",
      config.defaultMode === "light" ? "light" : "dark",
    );
    await expect(
      page.locator('style[data-vite-dev-id$="/src/index.css"]'),
    ).toHaveCount(0);
    await expect(
      page.locator(".ui-nav-link[aria-current='page']"),
    ).toHaveAttribute("data-surface-level", "3");
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Skip to main content" }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
  });
}
