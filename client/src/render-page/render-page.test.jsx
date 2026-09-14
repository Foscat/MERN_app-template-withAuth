/** @module client/render-page.test
 * @description Public HTML generation includes meaningful page content without a browser.
 */
import { expect, it } from "vitest";
it("renders public content without depending on client navigation", async () => {
  const { renderPage } = await import("./render-page.jsx");
  const result = renderPage("/");
  expect(result.html).toContain("<h1");
  expect(result.html).toContain("MERN Forge");
  expect(renderPage("/missing").html).toContain("Page not found");
});
