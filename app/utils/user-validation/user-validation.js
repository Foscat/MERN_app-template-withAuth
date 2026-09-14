/**
 * @module app/utils/user-validation
 * @description Validation and allowlisting helpers for authentication and user-management input.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-z0-9._-]{3,40}$/;
const ROLES = new Set(["user", "admin"]);
const MAX_PASSWORD_BYTES = 72;
const MIN_PASSWORD_LENGTH = 12;

/**
 * Error raised when a user-supplied field fails validation.
 *
 * @extends Error
 */
class ValidationError extends Error {
  /**
   * Create a validation error suitable for a client-safe response.
   *
   * @param {string} message - Human-readable validation failure.
   */
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
  }
}

/**
 * Require a plain object before reading request fields.
 *
 * @param {unknown} value - Candidate request body.
 * @returns {Record<string, unknown>} Validated plain object.
 * @throws {ValidationError} When the value is not a plain object.
 */
function requirePlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ValidationError("Request body must be a JSON object");
  }

  return value;
}

/**
 * Normalize and validate an email address.
 *
 * @param {unknown} value - Candidate email.
 * @returns {string} Lowercase email address.
 * @throws {ValidationError} When the email is missing or malformed.
 */
function normalizeEmail(value) {
  const email = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    throw new ValidationError("A valid email address is required");
  }

  return email;
}

/**
 * Validate a password against application and bcrypt size limits.
 *
 * @param {unknown} value - Candidate password.
 * @returns {string} Validated password without normalization.
 * @throws {ValidationError} When the password is too short or too large.
 */
function validatePassword(value) {
  if (typeof value !== "string" || value.length < MIN_PASSWORD_LENGTH) {
    throw new ValidationError(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    );
  }

  if (Buffer.byteLength(value, "utf8") > MAX_PASSWORD_BYTES) {
    throw new ValidationError("Password must be 72 bytes or fewer");
  }

  return value;
}

/**
 * Normalize a required short text field.
 *
 * @param {unknown} value - Candidate field value.
 * @param {string} label - Field name used in errors.
 * @param {number} maxLength - Maximum permitted character length.
 * @returns {string} Trimmed text.
 * @throws {ValidationError} When the text is missing or too long.
 */
function normalizeRequiredText(value, label, maxLength) {
  const text = typeof value === "string" ? value.trim() : "";

  if (!text || text.length > maxLength) {
    throw new ValidationError(
      `${label} is required and must be ${maxLength} characters or fewer`,
    );
  }

  return text;
}

/**
 * Validate and normalize public registration input.
 *
 * Authorization fields are intentionally never returned.
 *
 * @param {unknown} value - Candidate request body.
 * @returns {Object} Safe registration data with optional phone number.
 */
function validateRegistrationInput(value) {
  const input = requirePlainObject(value);
  const username = normalizeRequiredText(input.username, "Username", 40)
    .toLowerCase()
    .replace(/\s+/g, "");

  if (!USERNAME_PATTERN.test(username)) {
    throw new ValidationError(
      "Username must contain 3-40 letters, numbers, dots, underscores, or hyphens",
    );
  }

  const result = {
    name: normalizeRequiredText(input.name, "Name", 100),
    username,
    email: normalizeEmail(input.email),
    password: validatePassword(input.password),
  };

  if (typeof input.phone_num === "string" && input.phone_num.trim()) {
    result.phoneNumber = input.phone_num.trim().slice(0, 30);
  }

  if (typeof input.phoneNumber === "string" && input.phoneNumber.trim()) {
    result.phoneNumber = input.phoneNumber.trim().slice(0, 30);
  }

  return result;
}

/**
 * Validate login credentials without mutating the password.
 *
 * @param {unknown} value - Candidate request body.
 * @returns {{email: string, password: string}} Safe login data.
 */
function validateLoginInput(value) {
  const input = requirePlainObject(value);

  return {
    email: normalizeEmail(input.email),
    password: validatePassword(input.password),
  };
}

/**
 * Build an allowlisted partial update for a user profile.
 *
 * @param {unknown} value - Candidate request body.
 * @param {Object} [options] - Authorization-aware options.
 * @param {boolean} [options.allowRole=false] - Whether role changes are accepted.
 * @returns {Record<string, string>} Validated update fields.
 * @throws {ValidationError} When no editable fields are supplied.
 */
function validateUserUpdateInput(value, { allowRole = false } = {}) {
  const input = requirePlainObject(value);
  const update = {};

  if (input.name !== undefined) {
    update.name = normalizeRequiredText(input.name, "Name", 100);
  }

  if (input.username !== undefined) {
    const username = normalizeRequiredText(input.username, "Username", 40)
      .toLowerCase()
      .replace(/\s+/g, "");
    if (!USERNAME_PATTERN.test(username)) {
      throw new ValidationError("Username format is invalid");
    }
    update.username = username;
  }

  if (input.email !== undefined) {
    update.email = normalizeEmail(input.email);
  }

  if (input.password !== undefined) {
    update.password = validatePassword(input.password);
  }

  const rawPhone = input.phoneNumber ?? input.phone_num;
  if (rawPhone !== undefined) {
    if (rawPhone !== null && typeof rawPhone !== "string") {
      throw new ValidationError("Phone number must be text or null");
    }
    update.phoneNumber =
      rawPhone === null ? null : rawPhone.trim().slice(0, 30);
  }

  if (allowRole && input.role !== undefined) {
    if (typeof input.role !== "string" || !ROLES.has(input.role)) {
      throw new ValidationError("Role must be user or admin");
    }
    update.role = input.role;
  }

  if (Object.keys(update).length === 0) {
    throw new ValidationError("No editable user fields were supplied");
  }

  return update;
}

/**
 * Convert list query parameters to a bounded, operator-free database query.
 *
 * @param {unknown} value - Candidate query object.
 * @returns {{filter: Record<string, string>, limit: number, skip: number}} Safe query details.
 */
function buildUserListFilter(value) {
  const input = requirePlainObject(value);
  const filter = {};

  if (typeof input.email === "string" && input.email.trim()) {
    filter.email = normalizeEmail(input.email);
  }

  if (typeof input.username === "string" && input.username.trim()) {
    filter.username = input.username.trim().toLowerCase().slice(0, 40);
  }

  if (typeof input.role === "string" && ROLES.has(input.role)) {
    filter.role = input.role;
  }

  const limit = Math.min(
    Math.max(Number.parseInt(input.limit, 10) || 25, 1),
    100,
  );
  const page = Math.max(Number.parseInt(input.page, 10) || 1, 1);

  return { filter, limit, skip: (page - 1) * limit };
}

module.exports = {
  ValidationError,
  buildUserListFilter,
  validateLoginInput,
  validateRegistrationInput,
  validateUserUpdateInput,
};
