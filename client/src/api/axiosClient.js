/**
 * @module client/src/api/axiosClient
 * @description Shared axios instance configured for JWT auth and automatic token refresh.
 */

import axios from "axios";

/**
 * Axios instance for all frontend API requests.
 * @type {Object}
 */
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
/** @type {Array<Object>} */
let pendingRequests = [];

/**
 * Resolve or reject queued API requests waiting on token refresh.
 * @param {*} error - Error to reject with, if refresh failed.
 * @param {string | null} [token=null] - New access token if refresh succeeded.
 * @returns {void}
 */
const processQueue = (error, token = null) => {
  pendingRequests.forEach((pending) => {
    if (error) {
      pending.reject(error);
      return;
    }

    pending.resolve(token);
  });

  pendingRequests = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (!response) {
      return Promise.reject(error);
    }

    if (response.status === 401 && !config._retry) {
      config._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({
            resolve: (token) => {
              if (token) {
                config.headers.Authorization = `Bearer ${token}`;
              }
              resolve(api(config));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshRes = await api.post("/users/refresh");
        const newToken = refreshRes.data.token;

        localStorage.setItem("token", newToken);
        processQueue(null, newToken);

        config.headers.Authorization = `Bearer ${newToken}`;
        return api(config);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
