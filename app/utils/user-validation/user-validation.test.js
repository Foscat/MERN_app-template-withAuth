/**
 * @module app/utils/user-validation.test
 * @description Focused tests for user-input validation and field allowlisting.
 */

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const {
  ValidationError,
  buildUserListFilter,
  validateLoginInput,
  validateRegistrationInput,
  validateUserUpdateInput,
} = require("./user-validation.js");

describe("user validation", () => {
  it("normalizes registration data and ignores authorization fields", () => {
    const result = validateRegistrationInput({
      name: "  Avery Example  ",
      username: "  Avery.Example  ",
      email: "  AVERY@EXAMPLE.COM ",
      password: "correct horse battery staple",
      phone_num: " +1 (312) 555-0117 ",
      role: "admin",
    });

    assert.deepEqual(result, {
      name: "Avery Example",
      username: "avery.example",
      email: "avery@example.com",
      password: "correct horse battery staple",
      phoneNumber: "+1 (312) 555-0117",
    });
    assert.equal("role" in result, false);
  });

  it("rejects invalid credentials and bcrypt-truncated passwords", () => {
    assert.throws(
      () => validateLoginInput({ email: "not-an-email", password: "short" }),
      ValidationError,
    );
    assert.throws(
      () =>
        validateRegistrationInput({
          name: "Avery Example",
          username: "avery",
          email: "avery@example.com",
          password: "a".repeat(73),
        }),
      /72 bytes or fewer/,
    );
  });

  it("allows only editable profile fields and gates role changes", () => {
    const userUpdate = validateUserUpdateInput({
      name: "Updated Name",
      email: "updated@example.com",
      password: "new secure password",
      role: "admin",
      tokenVersion: 500,
      createdAt: "forged",
    });

    assert.deepEqual(userUpdate, {
      name: "Updated Name",
      email: "updated@example.com",
      password: "new secure password",
    });

    const adminUpdate = validateUserUpdateInput(
      { role: "admin" },
      { allowRole: true },
    );
    assert.deepEqual(adminUpdate, { role: "admin" });
  });

  it("converts list queries to a bounded allowlisted filter", () => {
    const result = buildUserListFilter({
      email: "  TEST@EXAMPLE.COM ",
      username: { $ne: null },
      role: "admin",
      password: { $exists: true },
      limit: "500",
      page: "-4",
    });

    assert.deepEqual(result, {
      filter: { email: "test@example.com", role: "admin" },
      limit: 100,
      skip: 0,
    });
  });
});
