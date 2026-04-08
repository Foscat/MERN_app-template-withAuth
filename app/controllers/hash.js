/**
 * @module app/controllers/hash
 * @description Password hashing utilities used by authentication flows.
 */

const bcrypt = require("bcrypt");

/**
 * Hash plain text input using bcrypt.
 * @param {string} input - Plain text password.
 * @returns {string} Bcrypt hash.
 */
function hashThis(input) {
  return bcrypt.hashSync(input, process.env.salt);
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

module.exports = { hashThis, compareHash };
