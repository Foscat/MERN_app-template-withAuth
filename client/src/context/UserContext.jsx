/**
 * @module context.UserContext
 * @description React authentication context backed by memory and a protected refresh cookie.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import api from "../api/axiosClient";
import { clearAccessToken, setAccessToken } from "../api/tokenStore";

const UserContext = createContext(null);

/**
 * Provide refresh-cookie session restoration and user auth actions.
 *
 * @param {{children: React.ReactNode}} props - Provider props.
 * @returns {JSX.Element} Authentication context provider.
 */
function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const restorationStarted = useRef(false);

  /**
   * Apply a successful authentication response to memory.
   *
   * @param {{token: string, user: Object}} session - API session payload.
   * @returns {void}
   */
  const establishSession = useCallback((session) => {
    setAccessToken(session.token);
    setUser(session.user);
  }, []);

  /** Clear in-memory authentication state. @returns {void} */
  const clearSession = useCallback(() => {
    clearAccessToken();
    setUser(null);
  }, []);

  useEffect(() => {
    if (restorationStarted.current) {
      return undefined;
    }
    restorationStarted.current = true;

    /**
     * Restore the browser session from its HTTP-only cookie.
     *
     * @returns {Promise<void>}
     */
    async function restoreSession() {
      try {
        // console.log("restore session API call", { endpoint: "/users/refresh" });
        const response = await api.post("/users/refresh");
        establishSession(response.data);
        // console.log("restore session API return", { authenticated: true });
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    }

    void restoreSession();
    return undefined;
  }, [clearSession, establishSession]);

  useEffect(() => {
    const handleSessionExpired = () => clearSession();
    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, [clearSession]);

  /**
   * Revoke the refresh session and clear local authentication state.
   *
   * @returns {Promise<void>}
   */
  const logout = useCallback(async () => {
    try {
      // console.log("logout API call", { endpoint: "/users/logout" });
      await api.post("/users/logout");
      // console.log("logout API return", { loggedOut: true });
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({ clearSession, establishSession, loading, logout, user }),
    [clearSession, establishSession, loading, logout, user],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/**
 * Consume authentication context.
 *
 * @returns {{clearSession: Function, establishSession: Function, user: Object|null, loading: boolean, logout: Function}} User context value.
 * @throws {Error} When called outside `UserProvider`.
 */
function useUser() {
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return userContext;
}

const UseUser = useUser;

export { UserProvider, useUser, UseUser };
