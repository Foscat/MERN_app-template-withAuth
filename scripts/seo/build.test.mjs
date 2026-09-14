/** @module scripts/seo/build.test
 * @description Checks crawler-visible output and HTTP route artifacts after a production build.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { it } from "node:test";
import appearance from "../../client/src/config/site.js";
import { metadataFor, renderHead } from "../../shared/seo/seo.mjs";
it("emits all four configured stylesheets in semantic ownership order", async () => {
  const html = await readFile("client/dist/index.html", "utf8");
  const styles = [
    ...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/gu),
  ].map((match) => match[1]);
  assert.equal(styles.length, 4);
  assert.ok(styles[0].startsWith(`/assets/${appearance.style}-`));
  assert.match(styles[1], /interactive-surface-theme-/);
  assert.match(styles[2], /state-core-/);
  assert.match(styles[3], /layout-style-css-/);
});
it("ships prerendered content and non-indexable private shells", async () => {
  const home = await readFile("client/dist/index.html", "utf8");
  assert.match(home, /<h1/);
  assert.match(home, /data-prerendered="true"/);
  const site = JSON.parse(await readFile("shared/site.json", "utf8"));
  const routes = JSON.parse(await readFile("shared/routes.json", "utf8"));
  assert.ok(
    home.includes(
      renderHead(
        metadataFor(
          site,
          routes.find((route) => route.path === "/"),
        ),
      ),
    ),
  );
  const settings = await readFile("client/dist/settings/index.html", "utf8");
  assert.ok(
    settings.includes(
      renderHead(
        metadataFor(
          site,
          routes.find((route) => route.path === "/settings"),
        ),
      ),
    ),
  );
  assert.ok(!settings.includes('data-prerendered="true"'));
  assert.match(
    await readFile("client/dist/404.html", "utf8"),
    /Page not found/,
  );
});
