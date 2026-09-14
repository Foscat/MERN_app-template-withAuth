/**
 * @module main
 * @description Client entrypoint and configuration-driven stylesheet composition root.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App/App.jsx";
import ErrorBoundary from "./components/parts/ErrorBoundary/ErrorBoundary.jsx";
import siteConfig, { loadConfiguredStyle } from "./config/site";
import { ThemeProvider, UserProvider } from "./context/index.js";

/**
 * Load semantic CSS in ownership order before mounting the application.
 *
 * @returns {Promise<void>} Completion after styles and React are ready.
 */
async function renderApplication() {
  await loadConfiguredStyle(siteConfig);
  await import("ui-style-kit-css/interactive-surface-theme.css");
  await import("interactive-surface-css/state-core.css");
  await import("layout-style-css");

  const root = document.getElementById("root");
  const application = (
    <React.StrictMode>
      <ThemeProvider initialMode={root.dataset.initialMode}>
        <UserProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </UserProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
  if (root.dataset.prerendered === "true")
    ReactDOM.hydrateRoot(root, application);
  else ReactDOM.createRoot(root).render(application);
}

void renderApplication().catch(() => {
  const root = document.getElementById("root");
  if (!root.textContent)
    root.textContent =
      "The application could not start. Check the site configuration and reload this page.";
  root.setAttribute("role", "alert");
});
