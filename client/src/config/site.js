/**
 * @module config.site
 * @description Editable semantic appearance configuration for the client.
 */

/**
 * Site-wide semantic design settings.
 *
 * @typedef {Object} SiteConfig
 * @property {"light"|"dark"|"system"} [defaultMode="system"] - Initial mode or browser-owned system mode.
 * @property {string} [layoutGap="var(--ly-space-4)"] - Layout Style master gap as a valid CSS length or token.
 * @property {string} style - UI Style Kit preset name.
 * @property {string|null} theme - Shared color theme or the style's native palette.
 */

/**
 * Editable appearance configuration.
 *
 * Use `null` for `theme` to retain the selected style's native palette. When
 * `defaultMode` is omitted or set to `"system"`, the browser preference wins.
 *
 * @type {SiteConfig}
 */
const siteConfig = Object.freeze({
  defaultMode: "system",
  layoutGap: "var(--ly-space-4)",
  style: "cyberpunk",
  theme: "service-blue-red",
});

/** Lazy stylesheet loaders keyed by supported UI Style Kit preset. */
const STYLE_LOADERS = Object.freeze({
  "art-deco": () => import("ui-style-kit-css/visual/art-deco.css"),
  bauhaus: () => import("ui-style-kit-css/visual/bauhaus.css"),
  bento: () => import("ui-style-kit-css/visual/bento.css"),
  brutalism: () => import("ui-style-kit-css/visual/brutalism.css"),
  clay: () => import("ui-style-kit-css/visual/clay.css"),
  cyberpunk: () => import("ui-style-kit-css/visual/cyberpunk.css"),
  "data-terminal": () => import("ui-style-kit-css/visual/data-terminal.css"),
  "editorial-luxe": () => import("ui-style-kit-css/visual/editorial-luxe.css"),
  "industrial-utility": () =>
    import("ui-style-kit-css/visual/industrial-utility.css"),
  maximalist: () => import("ui-style-kit-css/visual/maximalist.css"),
  "minimal-saas": () => import("ui-style-kit-css/visual/minimal-saas.css"),
  neumorphism: () => import("ui-style-kit-css/visual/neumorphism.css"),
  "neo-noir": () => import("ui-style-kit-css/visual/neo-noir.css"),
  "organic-modern": () => import("ui-style-kit-css/visual/organic-modern.css"),
  "paper-editorial": () =>
    import("ui-style-kit-css/visual/paper-editorial.css"),
  "retro-glass": () => import("ui-style-kit-css/visual/retro-glass.css"),
  retrofuturism: () => import("ui-style-kit-css/visual/retrofuturism.css"),
  tactile: () => import("ui-style-kit-css/visual/tactile.css"),
  "technical-blueprint": () =>
    import("ui-style-kit-css/visual/technical-blueprint.css"),
  y2k: () => import("ui-style-kit-css/visual/y2k.css"),
});

/**
 * Load only the stylesheet selected by the site configuration.
 *
 * @param {SiteConfig} [config] - Appearance configuration to load.
 * @param {Object<string, Function>} [styleLoaders] - Preset loader registry.
 * @returns {Promise<unknown>} Loaded stylesheet module.
 * @throws {Error} When the configured style has no registered stylesheet.
 */
function loadConfiguredStyle(
  config = siteConfig,
  styleLoaders = STYLE_LOADERS,
) {
  const loadStyle = styleLoaders[config.style];
  if (typeof loadStyle !== "function") {
    throw new Error(`Unsupported site style: ${config.style}`);
  }
  return loadStyle();
}

export { loadConfiguredStyle, STYLE_LOADERS };
export default siteConfig;
