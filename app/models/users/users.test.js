/**
 * @module app/models/users.test
 * @description Focused tests for secure user schema defaults and serialization.
 */

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const User = require("./users.js");

describe("User model", () => {
  it("hides credentials, uses native timestamps, and stores phone text", () => {
    const passwordPath = User.schema.path("password");
    const tokenVersionPath = User.schema.path("tokenVersion");
    const phonePath = User.schema.path("phoneNumber");

    assert.equal(passwordPath.options.select, false);
    assert.equal(tokenVersionPath.options.select, false);
    assert.equal(tokenVersionPath.options.default, 0);
    assert.equal(phonePath.instance, "String");
    assert.equal(User.schema.options.timestamps, true);

    const user = new User({
      name: "Avery Example",
      username: "avery",
      email: "avery@example.com",
      password: "hidden-digest",
      tokenVersion: 7,
    });
    const serialized = user.toJSON();

    assert.equal(serialized.password, undefined);
    assert.equal(serialized.tokenVersion, undefined);
    assert.equal(serialized.__v, undefined);
    assert.equal(serialized.id, String(user._id));
    assert.equal(serialized._id, undefined);
  });
});
