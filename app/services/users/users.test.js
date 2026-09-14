/** @module app/services/users.test
 * @description Account service contract exercised through the real database boundary.
 */
const assert = require("node:assert/strict");
const { it } = require("node:test");
const mongoose = require("mongoose");
const { loadRuntimeConfig } = require("../../config/runtime/runtime.js");
it(
  "paginates tied creation dates without duplicates or mandatory counts",
  { skip: !process.env.TEST_MONGODB_URI },
  async () => {
    const { createUserService } = require("./users.js");
    const {
      createUserRepository,
    } = require("../../repositories/users/users.js");
    const { User } = require("../../models/index.js");
    const connection = await mongoose
      .createConnection(process.env.TEST_MONGODB_URI, {
        dbName: `cursor_${Date.now()}`,
      })
      .asPromise();
    const model = connection.model("CursorUser", User.schema);
    const createdAt = new Date("2026-01-01T00:00:00Z");
    try {
      await model.create(
        [1, 2, 3].map((id) => ({
          _id: `507f1f77bcf86cd79943900${id}`,
          name: `User ${id}`,
          username: `cursor-${id}`,
          email: `cursor-${id}@example.test`,
          password: "test-digest",
          createdAt,
        })),
      );
      const service = createUserService({
        config: loadRuntimeConfig({}),
        repository: createUserRepository({ model }),
      });
      const first = await service.findAll({ cursor: "", limit: "2" });
      const second = await service.findAll({
        cursor: first.pagination.nextCursor,
        limit: "2",
      });
      assert.deepEqual(
        [...first.users, ...second.users].map((user) => user.username),
        ["cursor-3", "cursor-2", "cursor-1"],
      );
      assert.equal(first.pagination.total, undefined);
      assert.equal(second.pagination.nextCursor, null);
      await assert.rejects(
        service.findAll({ cursor: "bad-cursor" }),
        /Invalid pagination cursor/,
      );
    } finally {
      await model.deleteMany({});
      await connection.close();
    }
  },
);
it(
  "registers safe accounts and invalidates sessions when passwords change",
  { skip: !process.env.TEST_MONGODB_URI },
  async () => {
    const { createUserService } = require("./users.js");
    await mongoose.connect(process.env.TEST_MONGODB_URI);
    try {
      const config = loadRuntimeConfig({
        NODE_ENV: "test",
        BCRYPT_ROUNDS: "10",
      });
      const service = createUserService({ config });
      const username = `account-${Date.now()}`;
      const session = await service.register({
        name: "Example",
        username,
        email: `${username}@example.test`,
        password: "A-strong-test-passphrase-42!",
        role: "admin",
      });
      assert.equal(session.user.role, "user");
      assert.equal(session.user.password, undefined);
      await service.update(
        session.user.id,
        { password: "New-strong-test-passphrase-42!" },
        { role: "user" },
      );
      await assert.rejects(service.sessions.authorize(session.token), {
        statusCode: 401,
      });
      await service.remove(session.user.id);
    } finally {
      await mongoose.disconnect();
    }
  },
);
