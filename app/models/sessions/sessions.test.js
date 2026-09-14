/** @module app/models/sessions.test
 * @description Persistence contract for private credentials and expiry cleanup.
 */
const assert = require("node:assert/strict");
const { it } = require("node:test");
const Session = require("./sessions.js");
it("hides refresh verifiers and declares an expiry cleanup index", () => {
  assert.equal(Session.schema.path("refreshHash").options.select, false);
  assert.ok(
    Session.schema
      .indexes()
      .some(
        ([keys, options]) =>
          keys.expiresAt === 1 && options.expireAfterSeconds === 0,
      ),
  );
});
