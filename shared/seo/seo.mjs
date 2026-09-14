/** @module shared/seo
 * @description Pure metadata policy shared by browser navigation and static HTML generation.
 */
/** Escape HTML/XML attribute and text content.
 * @param {unknown} value Plain value.
 * @returns {string} Escaped text. */
export function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/gu,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );
}
/** Validate public publishing settings without requiring a domain for local development.
 * @param {Object} site Public configuration.
 * @returns {void} */
export function validateSite(site) {
  if (!site.name || !site.language || !site.titleTemplate?.includes("%s"))
    throw new Error(
      "Site name, language, and a title template containing %s are required",
    );
  if (site.origin) {
    const origin = new URL(site.origin);
    if (
      origin.origin !== site.origin ||
      origin.username ||
      origin.password ||
      !["https:", "http:"].includes(origin.protocol)
    )
      throw new Error(
        "Site origin must be an HTTP origin without path or credentials",
      );
  }
  if (site.indexingEnabled) {
    if (
      !site.origin ||
      !site.description ||
      !site.socialImage ||
      !site.socialImageAlt
    )
      throw new Error(
        "Complete origin, description, and social image metadata before enabling indexing",
      );
    const origin = new URL(site.origin);
    if (
      origin.protocol !== "https:" ||
      /^(localhost|127\.|\[::1\])/.test(origin.hostname) ||
      /\.(test|invalid|localhost)$/.test(origin.hostname)
    )
      throw new Error("Indexing requires a public HTTPS production origin");
  }
}
/** Derive route metadata using a configured origin, never the request host.
 * @param {Object} site Public settings.
 * @param {Object} route Route settings.
 * @returns {Object} Safe metadata model. */
export function metadataFor(site, route) {
  return {
    title: site.titleTemplate.replace("%s", route.title || "Page not found"),
    description: route.description || site.description,
    language: site.language,
    name: site.name,
    canonical:
      site.origin && route.path ? new URL(route.path, site.origin).href : "",
    image:
      site.origin && (route.socialImage || site.socialImage)
        ? new URL(route.socialImage || site.socialImage, site.origin).href
        : "",
    imageAlt: route.socialImageAlt || site.socialImageAlt,
    robots:
      site.indexingEnabled &&
      route.access === "public" &&
      route.indexable === true
        ? "index, follow"
        : "noindex, follow",
  };
}
/** Produce complete crawler-visible head metadata.
 * @param {Object} metadata Resolved metadata.
 * @returns {string} HTML head fragment. */
export function renderHead(metadata) {
  const e = escapeHtml;
  const tags = [
    `<title>${e(metadata.title)}</title>`,
    `<meta name="description" content="${e(metadata.description)}">`,
    `<meta name="robots" content="${e(metadata.robots)}">`,
  ];
  if (metadata.canonical)
    tags.push(`<link rel="canonical" href="${e(metadata.canonical)}">`);
  for (const [property, content] of Object.entries({
    "og:type": "website",
    "og:site_name": metadata.name,
    "og:title": metadata.title,
    "og:description": metadata.description,
    "og:url": metadata.canonical,
    "og:image": metadata.image,
    "og:image:alt": metadata.imageAlt,
  }))
    if (content)
      tags.push(`<meta property="${property}" content="${e(content)}">`);
  for (const [name, content] of Object.entries({
    "twitter:card": metadata.image ? "summary_large_image" : "summary",
    "twitter:title": metadata.title,
    "twitter:description": metadata.description,
    "twitter:image": metadata.image,
    "twitter:image:alt": metadata.imageAlt,
  }))
    if (content) tags.push(`<meta name="${name}" content="${e(content)}">`);
  return tags.join("\n");
}
/** Generate a sitemap containing only deliberately indexable public routes.
 * @param {Object} site Settings.
 * @param {Object[]} routes Registry.
 * @returns {string} XML sitemap. */
export function createSitemap(site, routes) {
  const urls = routes
    .map((route) => metadataFor(site, route))
    .filter((meta) => meta.robots === "index, follow" && meta.canonical)
    .map((meta) => `<url><loc>${escapeHtml(meta.canonical)}</loc></url>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}
