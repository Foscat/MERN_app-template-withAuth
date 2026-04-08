/**
 * @module client/src/utils/UserContext
 * @description React authentication context with proactive token refresh handling.
 */

import { createContext, useContext, useEffect, useRef, useState } from "react";
import jwtDecode from "jwt-decode";

const UserContext = createContext();
const TOKEN_REFRESH_BUFFER_MS = 60 * 1000;

/**
 * Provide user auth state and logout actions to the app tree.
 * @param {{ children: * }} props - Provider props.
 * @returns {JSX.Element}
 */
export function UserProvider({ children }) {
  const [user, setUser] = useState(null); // decoded user info
  const [loading, setLoading] = useState(true); // prevent flash on load
  const refreshTimeoutRef = useRef(null);

  const clearRefreshTimeout = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  };

  const decodeStoredToken = (token) => {
    try {
      return jwtDecode(token); // decode JWT payload
    } catch (err) {
      console.error("Invalid JWT:", err);
      return null;
    }
  };

  const refreshToken = async () => {
    try {
      const response = await fetch("/api/users/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (!data?.token) {
        return null;
      }

      localStorage.setItem("token", data.token);
      return data.token;
    } catch (err) {
      console.error("Token refresh failed:", err);
      return null;
    }
  };

  const logout = () => {
    clearRefreshTimeout();
    localStorage.removeItem("token");
    setUser(null);
    setLoading(false);
    window.location.href = "/login";
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const decoded = decodeStoredToken(token);

    if (!decoded) {
      logout();
      return;
    }

    setUser(decoded);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    clearRefreshTimeout();

    if (!user) {
      return;
    }

    let cancelled = false;

    const ensureFreshToken = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (!cancelled) {
          setUser(null);
        }
        return;
      }

      const decoded = decodeStoredToken(token);

      if (!decoded) {
        if (!cancelled) {
          logout();
        }
        return;
      }

      if (!decoded.exp) {
        if (!cancelled) {
          logout();
        }
        return;
      }

      const msUntilExpiry = decoded.exp * 1000 - Date.now();

      if (msUntilExpiry <= TOKEN_REFRESH_BUFFER_MS) {
        const newToken = await refreshToken();

        if (!newToken) {
          if (!cancelled) {
            logout();
          }
          return;
        }

        const refreshedDecoded = decodeStoredToken(newToken);

        if (!refreshedDecoded) {
          if (!cancelled) {
            logout();
          }
          return;
        }

        if (!cancelled) {
          setUser(refreshedDecoded);
        }

        return;
      }

      refreshTimeoutRef.current = window.setTimeout(() => {
        void ensureFreshToken();
      }, msUntilExpiry - TOKEN_REFRESH_BUFFER_MS);
    };

    void ensureFreshToken();

    return () => {
      cancelled = true;
      clearRefreshTimeout();
    };
  }, [user, loading]);

  const value = {
    user,
    loading,
    setUser,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/**
 * Access user auth context values.
 * @returns {{ user: object|null, loading: boolean, setUser: Function, logout: Function }}
 */
export const useUser = () => useContext(UserContext);
