/**
 * @module app/controllers/hash.test
 * @description Focused tests for asynchronous bcrypt password operations.
 */

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const { compareHash, hashThis } = require("./hash.js");

describe("password hashing", () => {
  it("hashes asynchronously with bounded rounds and compares safely", async () => {
    process.env.BCRYPT_ROUNDS = "10";
    const pendingHash = hashThis("correct horse battery staple");

    assert.equal(typeof pendingHash.then, "function");
    const digest = await pendingHash;
    assert.notEqual(digest, "correct horse battery staple");
    assert.equal(
      await compareHash("correct horse battery staple", digest),
      true,
    );
    assert.equal(await compareHash("incorrect password", digest), false);
  });
});
