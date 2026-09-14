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
import { api, clearAccessToken, setAccessToken } from "../../api/index.js";
import { refreshSession } from "../../api/axiosClient/axiosClient.js";
import { getSessionEpoch } from "../../api/tokenStore/tokenStore.js";

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
  const [sessionError, setSessionError] = useState("");
  const restorationStarted = useRef(false);

  /**
   * Apply a successful authentication response to memory.
   *
   * @param {{token: string, user: Object}} session - API session payload.
   * @returns {void}
   */
  const establishSession = useCallback((session) => {
    clearAccessToken();
    setAccessToken(session.token);
    setUser(session.user);
  }, []);

  /** Clear in-memory authentication state.
   * @returns {void} */
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
      const epoch = getSessionEpoch();
      try {
        // console.log("restore session API call", { endpoint: "/users/refresh" });
        const session = await refreshSession();
        if (epoch === getSessionEpoch()) establishSession(session);
        // console.log("restore session API return", { authenticated: true });
      } catch (error) {
        if (epoch === getSessionEpoch()) {
          if ([401, 403].includes(error.response?.status)) clearSession();
          else
            setSessionError(
              "Your session could not be restored. Check your connection and reload to retry.",
            );
        }
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
    clearSession();
    try {
      // console.log("logout API call", { endpoint: "/users/logout" });
      await api.post("/users/logout");
      // console.log("logout API return", { loggedOut: true });
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      clearSession,
      establishSession,
      loading,
      logout,
      user,
      sessionError,
    }),
    [clearSession, establishSession, loading, logout, user, sessionError],
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
