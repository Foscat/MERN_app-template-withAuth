/**
 * @module scripts/admin/promote-user.test
 * @description Focused tests for guarded administrator-promotion configuration.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readPromotionConfig } from "./promote-user.mjs";

describe("administrator promotion configuration", () => {
  it("requires explicit confirmation, database URI, and a normalized email", () => {
    assert.throws(() => readPromotionConfig({}), /ALLOW_ADMIN_PROMOTION/);
    assert.throws(
      () => readPromotionConfig({ ALLOW_ADMIN_PROMOTION: "true" }),
      /MONGODB_URI/,
    );

    const result = readPromotionConfig({
      ADMIN_EMAIL: " Admin@Example.com ",
      ALLOW_ADMIN_PROMOTION: "true",
      MONGODB_URI: "mongodb://localhost/example",
    });
    assert.deepEqual(result, {
      email: "admin@example.com",
      mongodbUri: "mongodb://localhost/example",
    });
  });
});
