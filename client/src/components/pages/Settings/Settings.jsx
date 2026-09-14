/**
 * @module pages.Settings
 * @description Authenticated application settings route.
 */

import { DashboardLayout } from "../../parts/index.js";
import SessionManager from "../../parts/SessionManager/SessionManager.jsx";
import { useTheme } from "../../../context/ThemeContext/ThemeContext.jsx";

/**
 * Render appearance and starter configuration settings.
 *
 * @returns {JSX.Element} Settings route.
 */
export default function Settings() {
  const { mode, toggleMode } = useTheme();

  return (
    <DashboardLayout title="Settings">
      <SessionManager />
      <section className="ui-card ly-stack">
        <header className="ly-stack">
          <span className="ui-label">Appearance</span>
          <h2>Workspace mode</h2>
          <p className="ui-help-text">
            Service Blue + Red remains the product theme while the display mode
            can be adjusted for your environment.
          </p>
        </header>
        <div className="ui-switch ly-cluster ly-justify-between">
          <span className="ly-stack ly-gap-1">
            <strong id="mode-toggle-label">Dark interface</strong>
            <small className="ui-help-text">
              Currently {mode === "dark" ? "enabled" : "disabled"}
            </small>
          </span>
          <button
            aria-checked={mode === "dark"}
            aria-labelledby="mode-toggle-label"
            className={`ui-button interactive-surface${mode === "dark" ? " is-active" : ""}`}
            data-surface-level="2"
            data-surface-variant="accent"
            id="mode-toggle"
            role="switch"
            type="button"
            onClick={toggleMode}
          >
            {mode === "dark" ? "On" : "Off"}
          </button>
        </div>
      </section>
    </DashboardLayout>
  );
}
