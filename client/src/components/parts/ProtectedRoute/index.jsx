/**
 * @module components.parts.ProtectedRoute.index
 * @description Reusable presentational UI part component.
 */
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}
