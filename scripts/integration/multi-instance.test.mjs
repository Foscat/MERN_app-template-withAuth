/** @module scripts/integration/multi-instance.test
 * @description Real two-process verification with shared MongoDB/Redis and no sticky sessions.
 */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fork } from "node:child_process";
import { once } from "node:events";
import { it } from "node:test";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
it("shares quotas and device-session revocation across two real application processes", async () => {
  assert.ok(
    process.env.TEST_MONGODB_URI && process.env.TEST_REDIS_URL,
    "Set TEST_MONGODB_URI and TEST_REDIS_URL to isolated test infrastructure; this test never substitutes mocks",
  );
  const children = [];
  const namespace = `template-integration-${randomUUID()}`;
  let userId;
  try {
    for (let index = 0; index < 2; index++) {
      const child = fork(new URL("./worker.mjs", import.meta.url), [], {
        env: {
          ...process.env,
          NODE_ENV: "development",
          MONGODB_URI: process.env.TEST_MONGODB_URI,
          RATE_LIMIT_STORE: "redis",
          RATE_LIMIT_REDIS_URL: process.env.TEST_REDIS_URL,
          RATE_LIMIT_REDIS_PREFIX: namespace,
          DEPLOYMENT_MODE: "multi",
          BCRYPT_ROUNDS: "10",
        },
        silent: true,
      });
      children.push(child);
      const [message] = await once(child, "message", {
        signal: AbortSignal.timeout(15000),
      });
      assert.equal(message.type, "ready");
      child.baseURL = message.url;
    }
    const [a, b] = children;
    const registered = await fetch(`${a.baseURL}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Integration User",
        username: `test-${randomUUID().slice(0, 12)}`,
        email: `${randomUUID()}@example.test`,
        password: "Integration-test-passphrase-42!",
      }),
    });
    assert.equal(registered.status, 201);
    const session = await registered.json();
    userId = session.user.id;
    const cookie = registered.headers.get("set-cookie").split(";")[0];
    const refreshed = await fetch(`${b.baseURL}/api/users/refresh`, {
      method: "POST",
      headers: { Cookie: cookie },
    });
    assert.equal(refreshed.status, 200);
    assert.equal(
      (
        await fetch(`${a.baseURL}/api/users/logout-all`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${(await refreshed.json()).token}`,
          },
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await fetch(`${b.baseURL}/api/users/current`, {
          headers: { Authorization: `Bearer ${session.token}` },
        })
      ).status,
      401,
    );
    let limited = false;
    for (let index = 0; index < 305; index++) {
      const response = await fetch(
        `${children[index % 2].baseURL}/api/not-found`,
      );
      if (response.status === 429) {
        limited = true;
        break;
      }
      assert.equal(response.status, 404);
    }
    assert.ok(limited, "Quota must be shared, not 300 requests per instance");
    assert.equal((await fetch(`${a.baseURL}/api/health/ready`)).status, 200);
  } finally {
    await Promise.all(
      children.map(async (child) => {
        if (child.exitCode !== null) return;
        child.send({ type: "stop" });
        try {
          await once(child, "exit", { signal: AbortSignal.timeout(18000) });
        } catch {
          child.kill();
        }
      }),
    );
    if (userId) {
      const mongoose = require("mongoose");
      const { User, Session } = require("../../app/models/index.js");
      await mongoose.connect(process.env.TEST_MONGODB_URI);
      try {
        await Session.deleteMany({ userId });
        await User.deleteOne({ _id: userId });
      } finally {
        await mongoose.disconnect();
      }
    }
  }
});
