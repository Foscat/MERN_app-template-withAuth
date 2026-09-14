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
    await expect(page.locator(".app-root")).toHaveAttribute("data-ui", "bento");
    await expect(page.locator(".app-root")).toHaveAttribute(
      "data-theme",
      "service-blue-red",
    );
    await expect(page.locator(".app-root")).toHaveAttribute(
      "data-mode",
      "dark",
    );
  });
}
