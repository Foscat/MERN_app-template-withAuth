/**
 * @module components.AppSidebar
 * @description Authenticated workspace navigation using semantic links and states.
 */

import { NavLink } from "react-router-dom";
import Icon from "./Icon";
import { useUser } from "../context/UserContext";

const NAVIGATION_ITEMS = [
  {
    key: "dashboard",
    label: "Overview",
    path: "/dashboard",
    icon: "dashboard",
  },
  { key: "profile", label: "Profile", path: "/profile", icon: "user" },
  { key: "settings", label: "Settings", path: "/settings", icon: "settings" },
];

/**
 * Render dashboard navigation and its current-route state.
 *
 * @param {Object} props - Sidebar properties.
 * @param {string} [props.active] - Current navigation key.
 * @returns {JSX.Element} Authenticated navigation sidebar.
 */
export default function AppSidebar({ active }) {
  const { logout } = useUser();

  return (
    <aside
      className="ui-card bento-panel bento-sidebar app-sidebar"
      data-ly-area="sidebar"
    >
      <div className="bento-brand app-sidebar__brand">
        <span className="bento-brand-mark" aria-hidden="true">
          M
        </span>
        <span>
          <strong>Workspace</strong>
          <small>Member console</small>
        </span>
      </div>

      <nav
        className="ui-nav ly-stack app-sidebar__nav"
        aria-label="Workspace navigation"
      >
        {NAVIGATION_ITEMS.map((item) => (
          <NavLink
            aria-current={active === item.key ? "page" : undefined}
            className="ui-nav-link interactive-surface variant-subtle app-sidebar__link"
            key={item.key}
            to={item.path}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="bento-sidebar-spacer" />
      <div className="bento-sidebar-note ly-stack">
        <span className="bento-eyebrow">Template status</span>
        <strong>Ready to extend</strong>
        <p>Authentication, layout, and semantic styling are connected.</p>
      </div>
      <button
        className="ui-button interactive-surface variant-subtle app-sidebar__logout"
        type="button"
        onClick={logout}
      >
        <Icon name="logout" />
        Log out
      </button>
    </aside>
  );
}
