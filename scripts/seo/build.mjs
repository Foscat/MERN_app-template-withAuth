/** @module scripts/seo/build
 * @description Build public HTML, private SPA shells, and crawler artifacts from shared public configuration.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import {
  createSitemap,
  escapeHtml,
  metadataFor,
  renderHead,
  validateSite,
} from "../../shared/seo/seo.mjs";
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const client = path.join(root, "client");
const requireClient = createRequire(path.join(client, "package.json"));

/** Build both bundles and emit deterministic route documents.
 * @returns {Promise<void>} Build completion.
 */
export async function buildSite() {
  const site = JSON.parse(
    await readFile(path.join(root, "shared/site.json"), "utf8"),
  );
  const routes = JSON.parse(
    await readFile(path.join(root, "shared/routes.json"), "utf8"),
  );
  validateSite(site);
  const seen = new Set();
  for (const route of routes) {
    if (
      !/^\/(?:[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*)?$/u.test(route.path) ||
      seen.has(route.path) ||
      !["public", "private", "guest"].includes(route.access)
    )
      throw new Error(
        "Routes must have unique safe paths and an explicit access classification",
      );
    seen.add(route.path);
    if (
      site.indexingEnabled &&
      route.indexable &&
      (!route.title || (!route.description && route.path !== "/"))
    )
      throw new Error(`Complete SEO title and description for ${route.path}`);
  }
  const { build } = await import(
    pathToFileURL(requireClient.resolve("vite")).href
  );
  await build({ root: client, build: { manifest: true } });
  await build({
    root: client,
    build: {
      ssr: "src/render-page/render-page.jsx",
      outDir: "dist-ssr",
      rollupOptions: { output: { entryFileNames: "render-page.mjs" } },
    },
  });
  const { renderPage } = await import(
    pathToFileURL(path.join(client, "dist-ssr/render-page.mjs")).href
  );
  const template = (
    await readFile(path.join(client, "dist/index.html"), "utf8")
  )
    .replace(/<title>[\s\S]*?<\/title>/gu, "")
    .replace(/<meta\s+name="(?:description|robots)"[\s\S]*?>/gu, "");
  const manifest = JSON.parse(
    await readFile(path.join(client, "dist/.vite/manifest.json"), "utf8"),
  );
  const renderedHome = renderPage("/");
  const styleKeys = [
    `ui-style-kit-css/visual/${renderedHome.style}.css`,
    "ui-style-kit-css/interactive-surface-theme.css",
    "interactive-surface-css/state-core.css",
    "layout-style-css",
  ];
  const css = [];
  for (const specifier of styleKeys) {
    const key = path
      .relative(client, requireClient.resolve(specifier))
      .replaceAll("\\", "/");
    const before = css.length;
    for (const [source, entry] of Object.entries(manifest))
      if (source.includes(key)) {
        if (entry.file.endsWith(".css")) css.push(entry.file);
        css.push(...(entry.css || []));
      }
    if (css.length === before)
      throw new Error(`Missing configured stylesheet: ${key}`);
  }
  if (!css.length)
    throw new Error(
      "Configured semantic styles are absent from the build manifest",
    );
  const styles = [...new Set(css)]
    .map((file) => `<link rel="stylesheet" href="/${escapeHtml(file)}">`)
    .join("\n");
  /** Write a route document with an optional hydrated public body.
   * @param {Object} route Registry entry.
   * @param {string} output Relative output.
   * @returns {Promise<void>} Completion.
   */
  async function emit(route, output) {
    const prerendered = route.access === "public";
    const rendered = prerendered ? renderPage(route.path) : null;
    const meta = metadataFor(site, route);
    let html = template
      .replace(/<html[^>]*>/u, `<html lang="${escapeHtml(site.language)}">`)
      .replace("</head>", `${renderHead(meta)}\n${styles}\n</head>`);
    if (rendered)
      html = html.replace(
        '<div id="root"></div>',
        `<div id="root" data-prerendered="true" data-initial-mode="${rendered.mode}">${rendered.html}</div>`,
      );
    const target = path.join(client, "dist", output);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, html);
  }
  for (const route of routes)
    await emit(
      route,
      route.path === "/" ? "index.html" : `${route.path.slice(1)}/index.html`,
    );
  await emit(
    {
      path: "/404",
      title: "Page not found",
      access: "public",
      indexable: false,
    },
    "404.html",
  );
  await writeFile(
    path.join(client, "dist/sitemap.xml"),
    createSitemap(site, routes),
  );
  await writeFile(
    path.join(client, "dist/robots.txt"),
    `User-agent: *\nAllow: /\n${site.indexingEnabled ? `Sitemap: ${site.origin}/sitemap.xml\n` : ""}`,
  );
  await writeFile(
    path.join(client, "dist/routes-manifest.json"),
    JSON.stringify(
      routes.map((route) => ({
        path: route.path,
        indexable: metadataFor(site, route).robots === "index, follow",
      })),
      null,
      2,
    ),
  );
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  await buildSite();
