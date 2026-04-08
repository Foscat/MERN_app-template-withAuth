/**
 * @module client/src/api/API
 * @description Legacy API facade with auth helpers and user CRUD wrappers.
 */

import axios from "axios";
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
 * Authenticate and return an access token.
 * @param {LoginPayload} payload - Login payload.
 * @returns {Promise<{ token: string }>}
 */
export const loginUser = (payload) =>
  api.post("/users/login", payload).then((res) => res.data);

/**
 * Register and return an access token.
 * @param {RegisterPayload} payload - Register payload.
 * @returns {Promise<{ token: string }>}
 */
export const registerUser = (payload) =>
  api.post("/users/register", payload).then((res) => res.data);

/**
 * Create a user via legacy endpoint.
 * @param {object} userData - User fields.
 * @returns {Promise<Object>}
 */
export function addUser(userData) {
  return axios.post("/api/users", userData);
}

/**
 * Fetch all users.
 * @returns {Promise<Object>}
 */
export function getUsers() {
  return axios.get("/api/users");
}

/**
 * Update a user by id.
 * @param {string} id - User id.
 * @param {object} updateData - Fields to patch.
 * @returns {Promise<Object>}
 */
export function updateUser(id, updateData) {
  return axios.put(`/api/users/${id}`, updateData);
}

/**
 * Delete a user by id.
 * @param {string} id - User id.
 * @returns {Promise<Object>}
 */
export function deleteUser(id) {
  return axios.delete(`/api/users/${id}`);
}

/**
 * @deprecated Endpoint `/api/users/signIn` is legacy and may not exist.
 * @param {object} signInData - Sign-in payload.
 * @returns {Promise<Object>}
 */
export function signInUser(signInData) {
  return axios.post("/api/users/signIn", signInData);
}

/**
 * @deprecated Prefer `GET /api/users/current` through axiosClient with bearer auth.
 * @param {object} token - Legacy token payload.
 * @returns {Promise<Object>}
 */
export function currentUser(token) {
  return axios.post("/api/users/current", token);
}

const API = {
  loginUser,
  registerUser,
  addUser,
  getUsers,
  updateUser,
  deleteUser,
  signInUser,
  currentUser,
};

export default API;
