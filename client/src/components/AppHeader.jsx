/**
 * @module components.AppHeader
 * @description Authenticated workspace header with mode and account actions.
 */

import Icon from "./Icon";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";

/**
 * Render the authenticated workspace title, status, and account controls.
 *
 * @param {{title: string}} props - Header properties.
 * @returns {JSX.Element} Workspace header.
 */
export default function AppHeader({ title }) {
  const { mode, toggleMode } = useTheme();
  const { user, logout } = useUser();

  return (
    <header
      className="ui-card bento-panel app-workspace-header"
      data-ly-area="header"
    >
      <div className="ly-stack app-workspace-title">
        <span className="bento-eyebrow">Protected workspace</span>
        <h1>{title}</h1>
      </div>

      <div className="ly-cluster app-workspace-actions">
        <span className="ui-badge bento-status is-success">
          <span className="bento-live-dot" aria-hidden="true" />
          Session active
        </span>
        <button
          aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
          className="ui-icon-button interactive-surface icon-only variant-subtle"
          data-surface-variant="subtle"
          title={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
          type="button"
          onClick={toggleMode}
        >
          <Icon name={mode === "dark" ? "sun" : "moon"} />
        </button>
        <div className="app-account-chip">
          <span className="app-avatar" aria-hidden="true">
            {(user?.email?.[0] || "U").toUpperCase()}
          </span>
          <span>
            <strong>{user?.email || "Authenticated user"}</strong>
            <small>{user?.role || "member"}</small>
          </span>
        </div>
        <button
          className="ui-button interactive-surface variant-subtle"
          type="button"
          onClick={logout}
        >
          <Icon name="logout" size={18} />
          Log out
        </button>
      </div>
    </header>
  );
}
