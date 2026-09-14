/** @module shared/seo.test
 * @description Metadata escaping, publishing safeguards, and canonical route behavior.
 */
import assert from "node:assert/strict";
import { it } from "node:test";
it("escapes metadata and excludes private routes from search publishing", async () => {
  const { metadataFor, renderHead, validateSite, createSitemap } =
    await import("./seo.mjs");
  const site = {
    name: "Example",
    origin: "https://example.com",
    language: "en",
    titleTemplate: "%s | Example",
    description: "Useful services",
    socialImage: "/share.png",
    socialImageAlt: "Example preview",
    indexingEnabled: true,
  };
  validateSite(site);
  const route = {
    path: "/",
    title: 'Home " <script>',
    access: "public",
    indexable: true,
  };
  const head = renderHead(metadataFor(site, route));
  assert.match(head, /&lt;script&gt;/);
  assert.ok(!head.includes("<script>"));
  assert.equal(
    metadataFor(site, { ...route, access: "private" }).robots,
    "noindex, follow",
  );
  assert.equal(metadataFor(site, route).canonical, "https://example.com/");
  assert.ok(
    !createSitemap(site, [
      route,
      { path: "/settings", access: "private" },
    ]).includes("settings"),
  );
  assert.throws(() =>
    validateSite({ ...site, origin: "http://localhost:5173" }),
  );
});
