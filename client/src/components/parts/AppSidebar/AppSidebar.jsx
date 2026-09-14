/**
 * @module components.AppSidebar
 * @description Authenticated workspace navigation using semantic links and states.
 */

import routes from "../../../../../shared/routes.json";
import site from "../../../../../shared/site.json";
import AppIcon from "../AppIcon/AppIcon.jsx";
import Icon from "../Icon/Icon.jsx";
import RouteNavLink from "../RouteNavLink/RouteNavLink.jsx";
import { useUser } from "../../../context/UserContext/UserContext.jsx";

/** Shared navigation icon size in CSS pixels. */
const NAVIGATION_ICON_SIZE = 18;

const NAVIGATION_ITEMS = routes.filter((route) => route.workspace);

/**
 * Render dashboard navigation and its current-route state.
 *
 * @returns {JSX.Element} Authenticated navigation sidebar.
 */
export default function AppSidebar() {
  const { logout } = useUser();

  return (
    <aside
      className="ui-card ly-stack ly-justify-between"
      data-ly-area="sidebar"
    >
      <div className="ly-cluster">
        <AppIcon />
        <span className="ly-stack ly-gap-0">
          <strong>{site.name}</strong>
          <small className="ui-help-text">Member console</small>
        </span>
      </div>

      <nav
        className="ui-nav ly-stack ly-gap-2"
        aria-label="Workspace navigation"
      >
        {NAVIGATION_ITEMS.map((item) => (
          <RouteNavLink className="ly-w-full" key={item.path} to={item.path}>
            <Icon name={item.icon} navigation size={NAVIGATION_ICON_SIZE} />
            <span>{item.workspaceLabel || item.label}</span>
          </RouteNavLink>
        ))}
      </nav>

      <div className="ui-card ly-stack">
        <span className="ui-label">Template status</span>
        <strong>Ready to extend</strong>
        <p className="ui-help-text">
          Authentication, layout, and semantic styling are connected.
        </p>
      </div>
      <button
        className="ui-button interactive-surface variant-subtle ly-w-full"
        data-surface-level="1"
        data-surface-variant="subtle"
        type="button"
        onClick={logout}
      >
        <Icon name="logout" navigation size={NAVIGATION_ICON_SIZE} />
        Log out
      </button>
    </aside>
  );
}
