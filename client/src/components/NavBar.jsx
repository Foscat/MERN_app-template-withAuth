/**
 * @module components.NavBar
 * @description Primary application navigation rendered with semantic UI hooks.
 */

import { Link, NavLink } from "react-router-dom";
import Icon from "./Icon";
import { useUser } from "../context/UserContext";

/**
 * Render the global navigation with authentication-aware actions.
 *
 * @returns {JSX.Element} Primary application navigation.
 */
export default function NavBar() {
  const { user, logout } = useUser();

  return (
    <header className="app-global-header ui-toolbar" data-ly-area="header">
      <div className="ly-wrapper ly-wrapper--workspace ly-cluster app-global-header__inner">
        <Link className="app-brand interactive-surface variant-subtle" to="/">
          <span className="bento-brand-mark" aria-hidden="true">
            M
          </span>
          <span>
            <strong>MERN Forge</strong>
            <small>Secure starter workspace</small>
          </span>
        </Link>

        <nav
          className="ui-nav ly-cluster app-primary-nav"
          aria-label="Primary navigation"
        >
          <NavLink
            className="ui-nav-link interactive-surface variant-subtle"
            to="/"
            end
          >
            Home
          </NavLink>
          {user ? (
            <NavLink
              className="ui-nav-link interactive-surface variant-subtle"
              to="/dashboard"
            >
              Dashboard
            </NavLink>
          ) : null}
        </nav>

        <div className="ly-cluster app-nav-actions">
          {user ? (
            <button
              className="ui-button interactive-surface variant-subtle"
              type="button"
              onClick={logout}
            >
              <Icon name="logout" size={18} />
              Log out
            </button>
          ) : (
            <Link
              className="ui-button interactive-surface variant-primary"
              data-ui-variant="primary"
              to="/login"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
