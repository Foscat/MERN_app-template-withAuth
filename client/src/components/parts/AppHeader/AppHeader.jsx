/**
 * @module components.AppHeader
 * @description Authenticated workspace header with mode and account actions.
 */

import Icon from "../Icon/Icon.jsx";
import { useTheme } from "../../../context/ThemeContext/ThemeContext.jsx";
import { useUser } from "../../../context/UserContext/UserContext.jsx";

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
    <header className="ui-card ly-action-bar" data-ly-area="header">
      <div className="ly-stack ly-gap-0">
        <span className="ui-label">Protected workspace</span>
        <h1>{title}</h1>
      </div>

      <div className="ly-cluster ly-justify-end">
        <span className="ui-badge" data-ui-variant="success">
          <Icon name="activity" size={14} />
          Session active
        </span>
        <button
          aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
          aria-pressed={mode === "dark"}
          className="ui-icon-button interactive-surface icon-only variant-subtle"
          data-surface-level="2"
          data-surface-variant="subtle"
          title={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
          type="button"
          onClick={toggleMode}
        >
          <Icon name={mode === "dark" ? "sun" : "moon"} />
        </button>
        <div className="ly-cluster">
          <span
            className="ui-badge"
            data-ui-variant="primary"
            aria-hidden="true"
          >
            {(user?.email?.[0] || "U").toUpperCase()}
          </span>
          <span className="ly-stack ly-gap-0">
            <strong>{user?.email || "Authenticated user"}</strong>
            <small className="ui-help-text">{user?.role || "member"}</small>
          </span>
        </div>
        <button
          className="ui-button interactive-surface variant-subtle"
          data-surface-level="1"
          data-surface-variant="subtle"
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
