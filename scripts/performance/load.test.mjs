/** @module scripts/performance/load.test
 * @description The local load runner reports actual request failures and bounded concurrency.
 */
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { it } from "node:test";
it("counts unsuccessful requests instead of hiding them in latency results", async () => {
  const { measure } = await import("./load.mjs");
  let count = 0;
  const server = createServer((req, res) => {
    res.writeHead(++count % 2 ? 200 : 503);
    res.end("test");
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    const result = await measure(
      `http://127.0.0.1:${server.address().port}/`,
      2,
      10,
    );
    assert.equal(result.requests, 10);
    assert.equal(result.errors, 5);
    assert.ok(result.p95Ms >= 0);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
