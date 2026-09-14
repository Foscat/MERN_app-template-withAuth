/** @module scripts/integration/worker
 * @description Isolated application process for local integration and capacity measurements.
 */
import { createRequire } from "node:module";
import { monitorEventLoopDelay } from "node:perf_hooks";
const require = createRequire(import.meta.url);
const { startServer } = require("../../app/server/server.js");
const { loadRuntimeConfig } = require("../../app/config/runtime/runtime.js");
const mongoose = require("mongoose");
const delay = monitorEventLoopDelay({ resolution: 20 });
delay.enable();
const server = await startServer({ ...loadRuntimeConfig(), port: 0 });
let connections = 0;
mongoose.connection.getClient().on("connectionCreated", () => {
  connections++;
});
mongoose.connection.getClient().on("connectionClosed", () => {
  connections--;
});
process.send?.({
  type: "ready",
  url: `http://127.0.0.1:${server.address().port}`,
});
process.on("message", (message) => {
  if (message.type === "metrics")
    process.send?.({
      type: "metrics",
      memory: process.memoryUsage(),
      eventLoopP99Ms: delay.percentile(99) / 1e6,
      connectionsOpenedSinceReady: connections,
    });
  if (message.type === "stop") {
    delay.disable();
    process.disconnect();
    process.emit("SIGTERM", "SIGTERM");
  }
});
