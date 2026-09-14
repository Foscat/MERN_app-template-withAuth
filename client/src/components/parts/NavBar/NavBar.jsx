/**
 * @module components.NavBar
 * @description Primary application navigation rendered with semantic UI hooks.
 */

import { Link } from "react-router-dom";
import routes from "../../../../../shared/routes.json";
import site from "../../../../../shared/site.json";
import AppIcon from "../AppIcon/AppIcon.jsx";
import Icon from "../Icon/Icon.jsx";
import RouteNavLink from "../RouteNavLink/RouteNavLink.jsx";
import { useUser } from "../../../context/UserContext/UserContext.jsx";

/** Shared navigation icon size in CSS pixels. */
const NAVIGATION_ICON_SIZE = 18;

/**
 * Render the global navigation with authentication-aware actions.
 *
 * @returns {JSX.Element} Primary application navigation.
 */
export default function NavBar() {
  const { user, logout, sessionError } = useUser();

  return (
    <header
      className="ly-header ly-header--sticky ui-toolbar"
      data-ly-area="header"
    >
      {sessionError ? (
        <p className="ui-alert" role="alert">
          {sessionError}
        </p>
      ) : null}
      <div className="ly-wrapper ly-wrapper--workspace ly-cluster ly-justify-between">
        <Link
          className="ui-nav-link ly-gap-2 interactive-surface variant-subtle"
          data-surface-level="1"
          data-surface-variant="subtle"
          to="/"
        >
          <AppIcon />
          <span className="ly-stack ly-gap-0" aria-hidden="true">
            <strong>{site.name}</strong>
            <small className="ui-help-text">{site.tagline}</small>
          </span>
        </Link>

        <nav className="ui-nav ly-cluster" aria-label="Primary navigation">
          {routes
            .filter(
              (route) =>
                route.primary &&
                (route.access === "public" ||
                  (user
                    ? route.access === "private"
                    : route.access === "guest")),
            )
            .map((route) => (
              <RouteNavLink
                key={route.path}
                to={route.path}
                end={route.path === "/"}
              >
                <Icon
                  name={route.icon || "home"}
                  navigation
                  size={NAVIGATION_ICON_SIZE}
                />
                {route.label}
              </RouteNavLink>
            ))}
        </nav>

        {user ? (
          <div className="ly-cluster">
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
        ) : null}
      </div>
    </header>
  );
}
