/**
 * @module api.axiosClient
 * @description Shared API client with in-memory bearer tokens and bounded refresh retries.
 */

import axios from "axios";
import {
  clearAccessToken,
  getAccessToken,
  getSessionEpoch,
  setAccessTokenIfCurrent,
} from "../tokenStore/tokenStore.js";

const AUTH_ENDPOINTS = new Set([
  "/users/login",
  "/users/logout",
  "/users/refresh",
  "/users/register",
]);

/** Axios instance used for all maintained frontend API requests.
 * @type {Object} */
const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
  withCredentials: true,
});

/**
 * Attach the current in-memory access token to a request.
 *
 * @param {Object} config - Axios request configuration.
 * @returns {Object} Request configuration with authorization metadata.
 */
export function attachAccessToken(config) {
  // console.log("API request interceptor called", { method: config.method, url: config.url });
  config._sessionEpoch ??= getSessionEpoch();
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  // console.log("API request interceptor return", { hasAccessToken: Boolean(token) });
  return config;
}

/**
 * Decide whether a failed request may perform one refresh attempt.
 *
 * @param {Object} error - Axios error details.
 * @returns {boolean} Whether the request is eligible for refresh.
 */
export function shouldAttemptRefresh(error) {
  const config = error.config;
  const path = config?.url?.split("?")[0];
  return Boolean(
    error.response?.status === 401 &&
    config &&
    !config._retry &&
    !AUTH_ENDPOINTS.has(path),
  );
}

api.interceptors.request.use(attachAccessToken, (error) => {
  // console.log("API request interceptor rejected", { name: error.name });
  return Promise.reject(error);
});

let refreshing = null;
let waiters = 0;

/**
 * Serialize refreshes within a tab and, where supported, across browser tabs.
 * No credential is stored in cross-tab storage or messages.
 * @returns {Promise<Object>} Fresh session payload.
 */
export async function refreshSession() {
  if (waiters >= 100)
    throw new Error("Too many requests are awaiting authentication");
  waiters++;
  try {
    if (!refreshing) {
      const epoch = getSessionEpoch();
      /** Rotate with a bounded retry for a simultaneous cookie rotation.
       * @returns {Promise<Object>} Session payload. */
      const rotate = async () => {
        for (let attempt = 0; attempt < 3; attempt++) {
          if (epoch !== getSessionEpoch()) throw new Error("Session changed");
          try {
            // console.log("refresh session API call", { endpoint: "/users/refresh" });
            const response = await api.post("/users/refresh");
            // console.log("refresh session API return", { refreshed: Boolean(response.data?.token) });
            if (epoch !== getSessionEpoch()) throw new Error("Session changed");
            return response.data;
          } catch (error) {
            if (error.response?.status !== 409 || attempt === 2) throw error;
            await new Promise((resolve) => setTimeout(resolve, 150));
          }
        }
      };
      const locks = globalThis.navigator?.locks;
      refreshing = (
        locks
          ? locks.request(
              "mern-session-refresh",
              { signal: AbortSignal.timeout(20000) },
              rotate,
            )
          : rotate()
      ).finally(() => {
        refreshing = null;
      });
    }
    return await refreshing;
  } finally {
    waiters--;
  }
}

/** Notify the provider of confirmed authentication expiry.
 * @returns {void} */
function notifySessionExpired() {
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event("auth:session-expired"));
}

api.interceptors.response.use(
  (response) => {
    // console.log("API response interceptor return", { status: response.status, url: response.config?.url });
    return response;
  },
  async (error) => {
    // console.log("API response interceptor called", { status: error.response?.status });
    if (!shouldAttemptRefresh(error)) throw error;
    const original = error.config;
    const epoch = original._sessionEpoch ?? getSessionEpoch();
    if (epoch !== getSessionEpoch()) throw error;
    original._retry = true;
    try {
      const session = await refreshSession();
      if (!setAccessTokenIfCurrent(session.token, epoch))
        throw new Error("Session changed");
      original.headers = {
        ...original.headers,
        Authorization: `Bearer ${session.token}`,
      };
      return api(original);
    } catch (failure) {
      if (
        [401, 403].includes(failure.response?.status) &&
        epoch === getSessionEpoch()
      ) {
        clearAccessToken();
        notifySessionExpired();
      }
      throw failure;
    }
  },
);
export default api;
