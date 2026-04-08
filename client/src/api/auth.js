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
 * @property {number} [phone_num] - Optional phone number.
 * @property {string} [role] - Optional role override.
 */

/**
 * Log in with credentials and receive an access token.
 * @param {LoginPayload} payload - Login request payload.
 * @returns {Promise<{ token: string }>} API response payload.
 */
export const loginUser = (payload) =>
  api.post("/users/login", payload).then((res) => res.data);

/**
 * Register a new account and receive an access token.
 * @param {RegisterPayload} payload - Registration request payload.
 * @returns {Promise<{ token: string }>} API response payload.
 */
export const registerUser = (payload) =>
  api.post("/users/register", payload).then((res) => res.data);
