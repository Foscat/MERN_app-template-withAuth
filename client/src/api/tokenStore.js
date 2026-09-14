/**
 * @module api.tokenStore
 * @description In-memory storage for short-lived access tokens.
 */

/** @type {string|null} */
let accessToken = null;

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
  accessToken = null;
}
