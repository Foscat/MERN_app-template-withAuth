/**
 * @module components.ProtectedRoute
 * @description Route-guard component that restricts access to authenticated users.
 */
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

/**
 * @function ProtectedRoute
 * @description A higher-order component that protects routes based on user authentication and roles. Redirects to login if not authenticated and to dashboard if the user role is not allowed.
 * @param {Object} param0 - The props object.
 * @param {React.ReactNode} param0.children - The child components to render if access is allowed.
 * @param {Array<string>} param0.allowedRoles - The array of roles allowed to access the route.
 * @returns {JSX.Element} - The rendered component or a redirect.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useUser();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
