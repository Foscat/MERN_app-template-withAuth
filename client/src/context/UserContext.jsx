/**
 * @module client/src/context/UserContext
 * @description React authentication context backed by the JWT stored in localStorage.
 */

import { createContext, useContext, useEffect, useState } from "react";
import jwtDecode from "jwt-decode";
import api from "../api/axiosClient";

const UserContext = createContext(null);

/**
 * Decode a JWT and return its payload.
 * @param {string} token - JWT string.
 * @returns {object|null} Decoded token payload or `null` for invalid tokens.
 */
const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

/**
 * Provide user auth state and actions.
 * @param {{ children: * }} props - Provider props.
 * @returns {JSX.Element}
 */
function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const decoded = decodeToken(token);
    if (!decoded) {
      localStorage.removeItem("token");
      setUser(null);
      setLoading(false);
      return;
    }

    setUser(decoded);
    setLoading(false);
  }, []);

  /**
   * Log out and clear both local token and refresh cookie.
   * @returns {Promise<void>}
   */
  const logout = async () => {
    try {
      await api.post("/users/logout");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      window.location.href = "/login";
    }
  };

  const value = {
    user,
    loading,
    setUser,
    logout,
    decodeToken,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/**
 * Consume authentication context.
 * @returns {{ user: object|null, loading: boolean, setUser: Function, logout: Function, decodeToken: Function }} User context value.
 * @throws {Error} When called outside `UserProvider`.
 */
const useUser = () => {
  const userContext = useContext(UserContext);

  if (!userContext) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return userContext;
};

const UseUser = useUser;

export { UserProvider, useUser, UseUser };
