/**
 * @module context.ThemeContext
 * @description Applies configured semantic appearance and persists user mode choices.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import siteConfig from "../../config/site";

const STORAGE_KEY = "ui-mode";
const ThemeContext = createContext(null);

/**
 * @typedef {Object} ThemeContextValue
 * @property {"light"|"dark"} mode - Active UI color mode.
 * @property {string} layoutGap - Active Layout Style master gap.
 * @property {string} style - Active UI Style Kit preset.
 * @property {string|null} theme - Active shared color theme or native palette.
 * @property {Function} toggleMode - Toggle between light and dark modes.
 * @property {Function} toggleTheme - Backward-compatible alias for `toggleMode`.
 */

/**
 * Resolve the initial display mode from user, site, and browser preferences.
 *
 * @param {Object} config - Appearance configuration.
 * @param {"light"|"dark"|"system"} [config.defaultMode] - Configured initial mode.
 * @returns {"light"|"dark"} Initial display mode.
 */
function resolveInitialMode(config) {
  if (typeof window === "undefined")
    return config.defaultMode === "dark" ? "dark" : "light";
  const storedMode = readStoredMode();
  if (storedMode === "light" || storedMode === "dark") {
    return storedMode;
  }
  if (config.defaultMode === "light" || config.defaultMode === "dark") {
    return config.defaultMode;
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Synchronize semantic appearance attributes on a document element.
 *
 * @param {HTMLElement} element - Document element to update.
 * @param {Object} config - Appearance configuration.
 * @param {string} config.style - UI Style Kit preset name.
 * @param {string|null} config.theme - Shared color theme or native palette.
 * @param {string} [config.layoutGap] - Layout Style master gap.
 * @param {"light"|"dark"} mode - Active display mode.
 * @param {boolean} [includeLayout] - Whether to include the layout-style attribute.
 * @returns {void}
 */
function applyAppearance(element, config, mode, includeLayout = false) {
  element.dataset.ui = config.style;
  element.dataset.mode = mode;
  if (config.theme) {
    element.dataset.theme = config.theme;
  } else {
    delete element.dataset.theme;
  }
  if (includeLayout) {
    element.dataset.lyLayout = config.style;
  }
  if (config.layoutGap) {
    element.style.setProperty("--ly-profile-gap", config.layoutGap);
  } else {
    element.style.removeProperty("--ly-profile-gap");
  }
}

/**
 * Provide configured semantic appearance state to the client application.
 *
 * @param {Object} props - Provider properties.
 * @param {React.ReactNode} props.children - Descendant application content.
 * @param {Object} [props.config] - Appearance configuration override.
 * @param {"light"|"dark"} [props.initialMode] - Deterministic build snapshot used during hydration.
 * @returns {JSX.Element} Theme context provider.
 */
function ThemeProvider({ children, config = siteConfig, initialMode }) {
  const [override, setOverride] = useState(null);
  const preference = useSyncExternalStore(
    subscribeMode,
    () => resolveInitialMode(config),
    () => initialMode || (config.defaultMode === "dark" ? "dark" : "light"),
  );
  const mode = override || preference;

  useEffect(() => {
    applyAppearance(document.body, config, mode, true);
    document.body.classList.add("ly-root");
    applyAppearance(document.documentElement, config, mode);
  }, [config, mode]);

  const toggleMode = useCallback(() => {
    const nextMode = mode === "dark" ? "light" : "dark";
    setOverride(nextMode);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextMode);
    } catch {
      /* Persistence is optional. */
    }
    window.dispatchEvent(new Event("theme:mode"));
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      layoutGap: config.layoutGap || "var(--ly-space-4)",
      style: config.style,
      theme: config.theme,
      toggleMode,
      toggleTheme: toggleMode,
    }),
    [config.layoutGap, config.style, config.theme, mode, toggleMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Read the current color mode and mode actions.
 *
 * @returns {ThemeContextValue} Theme context value.
 * @throws {Error} When called outside `ThemeProvider`.
 */
function useTheme() {
  const themeContext = useContext(ThemeContext);

  if (!themeContext) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return themeContext;
}

export { applyAppearance, resolveInitialMode, ThemeProvider, useTheme };

/** Read an optional preference without requiring browser storage.
 * @returns {string|null} Saved mode. */
function readStoredMode() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Subscribe to browser preference and explicit storage changes.
 * @param {Function} notify Snapshot invalidation callback.
 * @returns {Function} Cleanup. */
function subscribeMode(notify) {
  const media = window.matchMedia?.("(prefers-color-scheme: dark)");
  media?.addEventListener?.("change", notify);
  window.addEventListener("storage", notify);
  window.addEventListener("theme:mode", notify);
  return () => {
    media?.removeEventListener?.("change", notify);
    window.removeEventListener("storage", notify);
    window.removeEventListener("theme:mode", notify);
  };
}
