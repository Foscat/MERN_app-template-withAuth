/**
 * @module context.ThemeContext
 * @description Persists the UI Style Kit color mode and exposes mode controls.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const DEFAULT_MODE = "dark";
const STORAGE_KEY = "ui-mode";
const ThemeContext = createContext(null);

/**
 * @typedef {Object} ThemeContextValue
 * @property {"light"|"dark"} mode - Active UI color mode.
 * @property {"light"|"dark"} theme - Backward-compatible alias for `mode`.
 * @property {Function} toggleMode - Toggle between light and dark modes.
 * @property {Function} toggleTheme - Backward-compatible alias for `toggleMode`.
 */

/**
 * Provide the Bento UI mode state to the client application.
 *
 * @param {{children: React.ReactNode}} props - Provider properties.
 * @returns {JSX.Element} Theme context provider.
 */
function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    const storedMode = window.localStorage.getItem(STORAGE_KEY);
    return storedMode === "light" || storedMode === "dark"
      ? storedMode
      : DEFAULT_MODE;
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode);
    document.body.dataset.ui = "bento";
    document.body.dataset.theme = "service-blue-red";
    document.body.dataset.mode = mode;
    document.body.dataset.lyLayout = "bento";
    document.body.classList.add("ly-root");
    document.documentElement.dataset.ui = "bento";
    document.documentElement.dataset.theme = "service-blue-red";
    document.documentElement.dataset.mode = mode;
  }, [mode]);

  const toggleMode = useCallback(() => {
    setMode((currentMode) => (currentMode === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(
    () => ({ mode, theme: mode, toggleMode, toggleTheme: toggleMode }),
    [mode, toggleMode],
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

const UseTheme = useTheme;

export { ThemeProvider, UseTheme, useTheme };
