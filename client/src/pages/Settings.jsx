/**
 * @module pages.Settings
 * @description Authenticated application settings route.
 */

import DashboardLayout from "../layouts/DashboardLayout";
import { useTheme } from "../context/ThemeContext";

/**
 * Render appearance and starter configuration settings.
 *
 * @returns {JSX.Element} Settings route.
 */
export default function Settings() {
  const { mode, toggleMode } = useTheme();

  return (
    <DashboardLayout active="settings" title="Settings">
      <section className="ui-card bento-panel ly-stack app-settings-panel">
        <header className="ly-stack">
          <span className="bento-eyebrow">Appearance</span>
          <h2>Workspace mode</h2>
          <p className="app-muted">
            Service Blue + Red remains the product theme while the display mode
            can be adjusted for your environment.
          </p>
        </header>
        <label className="app-setting-row" htmlFor="mode-toggle">
          <span>
            <strong>Dark interface</strong>
            <small>Currently {mode === "dark" ? "enabled" : "disabled"}</small>
          </span>
          <input
            aria-checked={mode === "dark"}
            checked={mode === "dark"}
            className="ui-switch interactive-surface"
            id="mode-toggle"
            role="switch"
            type="checkbox"
            onChange={toggleMode}
          />
        </label>
      </section>
    </DashboardLayout>
  );
}
