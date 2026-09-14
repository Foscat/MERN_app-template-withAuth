/** @module scripts/dev/doctor.test
 * @description Diagnostics report actionable problems without reflecting secrets.
 */
import assert from "node:assert/strict";
import { it } from "node:test";
it("reports malformed configuration without including its sensitive value", async () => {
  const { inspectConfiguration } = await import("./doctor.mjs");
  const result = inspectConfiguration({
    NODE_ENV: "prod",
    JWT_ACCESS_SECRET: "private-value",
  });
  assert.equal(result.ok, false);
  assert.ok(!JSON.stringify(result).includes("private-value"));
});
