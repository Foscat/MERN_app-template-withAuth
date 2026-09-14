/** @module client/render-page
 * @description Build-only React renderer for public routes; no requests or private data are fetched.
 */
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import App from "../App/App.jsx";
import { ThemeProvider } from "../context/ThemeContext/ThemeContext.jsx";
import { UserProvider } from "../context/UserContext/UserContext.jsx";
import siteConfig from "../config/site.js";
/** Render deterministic HTML for hydration.
 * @param {string} pathname Public route.
 * @returns {{html: string, mode: string, style: string}} Static output. */
export function renderPage(pathname) {
  const mode = siteConfig.defaultMode === "dark" ? "dark" : "light";
  return {
    mode,
    style: siteConfig.style,
    html: renderToString(
      <ThemeProvider initialMode={mode}>
        <UserProvider>
          <App Router={StaticRouter} routerProps={{ location: pathname }} />
        </UserProvider>
      </ThemeProvider>,
    ),
  };
}
