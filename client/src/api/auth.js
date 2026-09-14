/**
 * @module client/src/api/auth
 * @description Auth-focused API utilities for login and registration.
 */

import api from "./axiosClient";

/**
 * @typedef {Object} LoginPayload
 * @property {string} email - User email.
 * @property {string} password - User password.
 */

/**
 * @typedef {Object} RegisterPayload
 * @property {string} email - User email.
 * @property {string} password - User password.
 * @property {string} [name] - Display name.
 * @property {string} [username] - Unique username.
 * @property {string} [phoneNumber] - Optional phone number.
 */

/**
 * Log in with credentials and receive an access token.
 * @param {LoginPayload} payload - Login request payload.
 * @returns {Promise<{ token: string }>} API response payload.
 */
export async function loginUser(payload) {
  // console.log("loginUser API call", { endpoint: "/users/login" });
  const response = await api.post("/users/login", payload);
  // console.log("loginUser API return", { authenticated: Boolean(response.data?.token) });
  return response.data;
}

/**
 * Register a new account and receive an access token.
 * @param {RegisterPayload} payload - Registration request payload.
 * @returns {Promise<{ token: string }>} API response payload.
 */
export async function registerUser(payload) {
  // console.log("registerUser API call", { endpoint: "/users/register" });
  const response = await api.post("/users/register", payload);
  // console.log("registerUser API return", { registered: Boolean(response.data?.token) });
  return response.data;
}
