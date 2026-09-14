/**
 * @module components.ProtectedRoute
 * @description Route-guard component that restricts access to authenticated users.
 */
import { Navigate } from "react-router-dom";
import { useUser } from "../../../context/UserContext/UserContext.jsx";

/**
 * Render protected content or redirect to the appropriate safe route.
 *
 * @param {Object} props - Route guard properties.
 * @param {React.ReactNode} props.children - Content rendered for authorized users.
 * @param {string[]} [props.allowedRoles] - Roles allowed to access the route.
 * @returns {JSX.Element|null} Protected content, redirect, or an empty loading state.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useUser();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
