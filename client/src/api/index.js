/**
 * @module api
 * @description Named client API entry point. Internal API modules import siblings directly to preserve one acyclic token store.
 */
import { loginUser, registerUser } from "./auth/auth.js";
import api, {
  attachAccessToken,
  shouldAttemptRefresh,
} from "./axiosClient/axiosClient.js";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "./tokenStore/tokenStore.js";

export {
  api,
  attachAccessToken,
  clearAccessToken,
  getAccessToken,
  loginUser,
  registerUser,
  setAccessToken,
  shouldAttemptRefresh,
};
export {
  getSessionEpoch,
  setAccessTokenIfCurrent,
} from "./tokenStore/tokenStore.js";
export { refreshSession } from "./axiosClient/axiosClient.js";
export { listSessions, revokeSession, logoutAll } from "./sessions/sessions.js";
