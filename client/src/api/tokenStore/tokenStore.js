/**
 * @module api.tokenStore
 * @description In-memory storage for short-lived access tokens.
 */

/** @type {string|null} */
let accessToken = null;
let sessionEpoch = 0;
/** Capture the current authentication lifetime.
 * @returns {number} Epoch. */
export function getSessionEpoch() {
  return sessionEpoch;
}
/** Ignore responses belonging to an ended authentication lifetime.
 * @param {string} token Access token.
 * @param {number} epoch Captured lifetime.
 * @returns {boolean} Whether applied. */
export function setAccessTokenIfCurrent(token, epoch) {
  if (epoch !== sessionEpoch) return false;
  setAccessToken(token);
  return true;
}

/**
 * Return the active access token without reading persistent browser storage.
 *
 * @returns {string|null} Current access token.
 */
export function getAccessToken() {
  return accessToken;
}

/**
 * Replace the active access token in module memory.
 *
 * @param {string} token - Short-lived access token.
 * @returns {void}
 */
export function setAccessToken(token) {
  accessToken = typeof token === "string" && token ? token : null;
}

/**
 * Remove the active access token from module memory.
 *
 * @returns {void}
 */
export function clearAccessToken() {
  sessionEpoch += 1;
  accessToken = null;
}
