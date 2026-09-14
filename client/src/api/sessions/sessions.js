/** @module api.sessions
 * @description Owned-device session management endpoints.
 */
import api from "../axiosClient/axiosClient.js";
/** List active device sessions.
 * @returns {Promise<Object>} Safe session metadata. */
export async function listSessions() {
  // console.log("listSessions API call");
  const response = await api.get("/users/sessions");
  // console.log("listSessions API return", { count: response.data.sessions.length });
  return response.data;
}
/** Revoke a session owned by the current account.
 * @param {string} id Session identifier.
 * @returns {Promise<Object>} Acknowledgment. */
export async function revokeSession(id) {
  // console.log("revokeSession API call", { sessionId: id });
  const response = await api.delete(
    `/users/sessions/${encodeURIComponent(id)}`,
  );
  // console.log("revokeSession API return");
  return response.data;
}
/** Revoke every device for the current account.
 * @returns {Promise<Object>} Acknowledgment. */
export async function logoutAll() {
  // console.log("logoutAll API call");
  const response = await api.post("/users/logout-all");
  // console.log("logoutAll API return");
  return response.data;
}
