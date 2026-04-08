/**
 * @module context.ThemeContext
 * @description React context provider and hook for theme selection and toggling.
 */
/**
 * @file ThemeContext.jsx
 * @description Provides a context for managing the application's theme (light/dark).
 * It allows components to access and toggle the current theme, and persists the theme choice in localStorage.
 */

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

/**
 * @function ThemeProvider
 * @description Provides a context provider for managing the application's theme (light/dark). It allows components to access and toggle the current theme, and persists the theme choice in localStorage.
 * @param {Object} param0 - The props object.
 * @param {React.ReactNode} param0.children - The child components to render within the provider.
 * @returns {JSX.Element} - The rendered provider component.
 */
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}


/**
 * @function UseTheme
 * @description A custom hook that provides access to the theme context. It allows components to access the current theme and toggle the theme. It also ensures that the hook is used within a ThemeProvider.
 * @returns {Object} - The current theme and a function to toggle the theme.
 * @throws {Error} - If the hook is used outside of a ThemeProvider.
 */
const UseTheme = () => {
  const themeContext = useContext(ThemeContext);
  if (!themeContext) {
    throw new Error("UseTheme must be used within a ThemeProvider");
  }
  return themeContext;
}

export { ThemeProvider, UseTheme };