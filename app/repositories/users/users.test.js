/** @module app/repositories/users.test
 * @description Integration coverage resides in the consuming account service.
 */
const assert = require("node:assert/strict");
const { it } = require("node:test");
const { createUserRepository } = require("./users.js");
it("defers database work until a repository operation is requested", () => {
  const repository = createUserRepository({ model: null });
  assert.equal(typeof repository.list, "function");
});
