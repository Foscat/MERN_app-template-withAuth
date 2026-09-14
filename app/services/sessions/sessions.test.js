/** @module app/services/sessions.test
 * @description Real MongoDB checks for independent, atomic, revocable sessions.
 */
const assert = require("node:assert/strict");
const { it } = require("node:test");
const mongoose = require("mongoose");
const { loadRuntimeConfig } = require("../../config/runtime/runtime.js");
it(
  "enforces expiry, current roles, and account deletion immediately",
  { skip: !process.env.TEST_MONGODB_URI },
  async () => {
    const { createSessionService } = require("./sessions.js");
    const { User, Session } = require("../../models/index.js");
    await mongoose.connect(process.env.TEST_MONGODB_URI);
    let user;
    try {
      user = await User.create({
        name: "Role Test",
        username: `role-${Date.now()}`,
        email: `role-${Date.now()}@example.test`,
        password: "test-digest",
      });
      let now = Date.now();
      const service = createSessionService({
        config: loadRuntimeConfig({ NODE_ENV: "test" }),
        now: () => now,
      });
      const credentials = await service.issue(user);
      await User.updateOne({ _id: user._id }, { $set: { role: "admin" } });
      assert.equal((await service.authorize(credentials.token)).role, "admin");
      now += 8 * 24 * 60 * 60 * 1000;
      await assert.rejects(service.refresh(credentials.refreshToken), {
        statusCode: 401,
      });
      now = Date.now();
      await User.deleteOne({ _id: user._id });
      await assert.rejects(service.authorize(credentials.token), {
        statusCode: 401,
      });
    } finally {
      if (user) await Session.deleteMany({ userId: user._id });
      await mongoose.disconnect();
    }
  },
);

it(
  "isolates devices and atomically rotates sessions across service instances",
  { skip: !process.env.TEST_MONGODB_URI },
  async () => {
    const { createSessionService } = require("./sessions.js");
    const models = require("../../models/index.js");
    await mongoose.connect(process.env.TEST_MONGODB_URI);
    try {
      const user = await models.User.create({
        name: "Session Test",
        username: `session-${Date.now()}`,
        email: `session-${Date.now()}@example.test`,
        password: "hashed-test-value",
      });
      const config = loadRuntimeConfig({ NODE_ENV: "test" });
      let now = Date.now();
      const first = createSessionService({ config, now: () => now });
      const second = createSessionService({ config, now: () => now });
      const deviceA = await first.issue(user);
      const deviceB = await second.issue(user);
      assert.notEqual(deviceA.sid, deviceB.sid);
      const results = await Promise.allSettled([
        first.refresh(deviceA.refreshToken),
        second.refresh(deviceA.refreshToken),
      ]);
      assert.equal(
        results.filter((result) => result.status === "fulfilled").length,
        1,
      );
      assert.equal(
        results.find((result) => result.status === "rejected").reason
          .statusCode,
        409,
      );
      await first.logout(deviceB.refreshToken);
      await assert.rejects(second.authorize(deviceB.token), {
        statusCode: 401,
      });
      const rotated = results.find(
        (result) => result.status === "fulfilled",
      ).value;
      assert.equal(
        (await second.authorize(rotated.token)).id,
        String(user._id),
      );
      now += 6000;
      await assert.rejects(first.refresh(deviceA.refreshToken), {
        statusCode: 401,
      });
      await assert.rejects(second.authorize(rotated.token), {
        statusCode: 401,
      });
      await models.Session.deleteMany({ userId: user._id });
      await models.User.deleteOne({ _id: user._id });
    } finally {
      await mongoose.disconnect();
    }
  },
);
