/**
 * @module api.axiosClient
 * @description Shared API client with in-memory bearer tokens and bounded refresh retries.
 */

import axios from "axios";
import { clearAccessToken, getAccessToken, setAccessToken } from "./tokenStore";

const AUTH_ENDPOINTS = new Set([
  "/users/login",
  "/users/logout",
  "/users/refresh",
  "/users/register",
]);

/** Axios instance used for all maintained frontend API requests. @type {Object} */
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

let isRefreshing = false;
/** @type {Array<{resolve: Function, reject: Function}>} */
let pendingRequests = [];

/**
 * Resolve or reject protected requests waiting for token rotation.
 *
 * @param {unknown} error - Refresh failure, when present.
 * @param {string|null} [token] - Rotated access token.
 * @returns {void}
 */
function processQueue(error, token = null) {
  // console.log("processQueue function called", { count: pendingRequests.length, failed: Boolean(error) });
  pendingRequests.forEach((pending) => {
    if (error) {
      pending.reject(error);
      return;
    }
    pending.resolve(token);
  });
  pendingRequests = [];
  // console.log("processQueue function return", { remaining: pendingRequests.length });
}

/**
 * Notify the application that refresh authentication can no longer continue.
 *
 * @returns {void}
 */
function notifySessionExpired() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth:session-expired"));
  }
}

api.interceptors.response.use(
  (response) => {
    // console.log("API response interceptor return", { status: response.status, url: response.config?.url });
    return response;
  },
  async (error) => {
    // console.log("API response interceptor called", { status: error.response?.status, url: error.config?.url });
    if (!shouldAttemptRefresh(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({
          reject,
          resolve: (token) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
        });
      });
    }

    isRefreshing = true;
    try {
      // console.log("refresh API call", { endpoint: "/users/refresh" });
      const refreshResponse = await api.post("/users/refresh");
      // console.log("refresh API return", { refreshed: Boolean(refreshResponse.data?.token) });
      const newToken = refreshResponse.data.token;
      setAccessToken(newToken);
      processQueue(null, newToken);

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      clearAccessToken();
      notifySessionExpired();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
