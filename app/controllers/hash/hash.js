/**
 * @module app/controllers/hash
 * @description Password hashing utilities used by authentication flows.
 */

const bcrypt = require("bcrypt");

/**
 * Read a bounded bcrypt work factor from runtime configuration.
 *
 * @returns {number} Cost factor between 10 and 15.
 */
function getBcryptRounds() {
  const parsed = Number.parseInt(process.env.BCRYPT_ROUNDS, 10);
  return Number.isInteger(parsed) ? Math.min(Math.max(parsed, 10), 15) : 12;
}

/**
 * Hash plain text input asynchronously using bcrypt.
 * @param {string} input - Plain text password.
 * @returns {Promise<string>} Bcrypt hash.
 */
function hashThis(input) {
  return bcrypt.hash(input, getBcryptRounds());
}

/**
 * Compare a plain text value to a bcrypt hash.
 * @param {string} plainTxt - Plain text password.
 * @param {string} hash - Stored bcrypt hash.
 * @returns {Promise<boolean>} True when the values match.
 */
function compareHash(plainTxt, hash) {
  return bcrypt.compare(plainTxt, hash);
}

module.exports = { compareHash, getBcryptRounds, hashThis };
