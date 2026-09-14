/**
 * @module components.RouteNavLink
 * @description Route-aware semantic navigation link with library-owned depth states.
 */

import { NavLink, useMatch, useResolvedPath } from "react-router-dom";

/**
 * Render a semantic navigation link whose surface depth follows the current route.
 *
 * @param {Object} props - Navigation-link properties.
 * @param {React.ReactNode} props.children - Link icon and label content.
 * @param {string} [props.className=""] - Semantic and composition classes.
 * @param {boolean} [props.end=false] - Require an exact pathname match.
 * @param {string} props.to - Destination pathname.
 * @returns {JSX.Element} Route-aware navigation link.
 */
export default function RouteNavLink({
  children,
  className = "",
  end = false,
  to,
}) {
  const resolvedPath = useResolvedPath(to);
  const isCurrentRoute = Boolean(
    useMatch({ end, path: resolvedPath.pathname }),
  );

  return (
    <NavLink
      className={`ui-nav-link interactive-surface ly-gap-2 ${className}`.trim()}
      data-surface-level={isCurrentRoute ? "3" : "1"}
      data-surface-variant="subtle"
      end={end}
      to={to}
    >
      {children}
    </NavLink>
  );
}
