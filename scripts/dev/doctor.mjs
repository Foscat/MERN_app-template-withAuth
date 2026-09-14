/** @module scripts/dev/doctor
 * @description Read-only onboarding diagnostics. Credentials and connection strings are never printed.
 */
import { createRequire } from "node:module";
import { access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
const require = createRequire(import.meta.url);
const { loadRuntimeConfig } = require("../../app/config/runtime/runtime.js");
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
/** Validate configuration without exposing supplied values.
 * @param {Object} environment Input mapping.
 * @returns {Object} Diagnostic result.
 */
export function inspectConfiguration(environment) {
  try {
    const config = loadRuntimeConfig(environment);
    return {
      ok: true,
      environment: config.nodeEnv,
      deploymentMode: config.deploymentMode,
      rateLimitStore: config.rateLimitStore,
    };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}
/** Inspect dependencies, build prerequisites, and infrastructure connectivity.
 * @returns {Promise<Object[]>} Diagnostics.
 */
export async function doctor() {
  require("dotenv").config({ path: path.join(root, ".env"), quiet: true });
  const results = [
    {
      check: "Node 22.19+ (22.x)",
      ok:
        Number(process.versions.node.split(".")[0]) === 22 &&
        Number(process.versions.node.split(".")[1]) >= 19,
    },
    { check: "configuration", ...inspectConfiguration(process.env) },
  ];
  for (const file of [
    "node_modules/mongoose/package.json",
    "client/node_modules/vite/package.json",
    "shared/site.json",
    "shared/routes.json",
  ]) {
    try {
      await access(path.join(root, file));
      results.push({ check: file, ok: true });
    } catch {
      results.push({
        check: file,
        ok: false,
        message: "Install dependencies or restore required configuration",
      });
    }
  }
  if (results.find((result) => result.check === "configuration").ok) {
    const config = loadRuntimeConfig();
    const mongoose = require("mongoose");
    let connection;
    try {
      connection = mongoose.createConnection(config.mongodbUri, {
        serverSelectionTimeoutMS: 2000,
        maxPoolSize: 1,
      });
      await connection.asPromise();
      results.push({ check: "MongoDB", ok: true });
    } catch {
      results.push({
        check: "MongoDB",
        ok: false,
        message: "Start the local Compose service or check database access",
      });
    } finally {
      await connection?.close();
    }
    if (config.rateLimitStore === "redis") {
      const client = require("redis").createClient({
        url: config.rateLimitRedisUrl,
        socket: { connectTimeout: 2000, reconnectStrategy: false },
        disableOfflineQueue: true,
      });
      client.on("error", () => {});
      try {
        await client.connect();
        await client.sendCommand(["PING"], { timeout: 2000 });
        results.push({ check: "Redis", ok: true });
      } catch {
        results.push({
          check: "Redis",
          ok: false,
          message: "Check shared-store connectivity",
        });
      } finally {
        if (client.isOpen) client.destroy();
      }
    }
  }
  return results;
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const results = await doctor();
  process.stdout.write(JSON.stringify(results, null, 2) + "\n");
  if (results.some((result) => !result.ok)) process.exitCode = 1;
}
