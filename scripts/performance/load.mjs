/** @module scripts/performance/load
 * @description Repeatable local-only HTTP capacity measurements; results describe the chosen workload, not a deployment guarantee.
 */
import { fork } from "node:child_process";
import { once } from "node:events";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";
import path from "node:path";
/** Measure a bounded local GET workload.
 * @param {string} url Loopback URL.
 * @param {number} concurrency Workers.
 * @param {number} requests Request count.
 * @returns {Promise<Object>} Latency and error measurements.
 */
export async function measure(url, concurrency, requests) {
  if (
    new URL(url).hostname !== "127.0.0.1" ||
    !Number.isInteger(concurrency) ||
    concurrency < 1 ||
    concurrency > 100 ||
    !Number.isInteger(requests) ||
    requests < 1 ||
    requests > 10000
  )
    throw new Error("Use a loopback URL and bounded positive workload sizes");
  const timings = [];
  let errors = 0;
  let next = 0;
  const started = performance.now();
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (next++ < requests) {
        const start = performance.now();
        try {
          const response = await fetch(url, {
            signal: AbortSignal.timeout(10000),
          });
          await response.arrayBuffer();
          if (!response.ok) errors++;
        } catch {
          errors++;
        }
        timings.push(performance.now() - start);
      }
    }),
  );
  timings.sort((a, b) => a - b);
  const elapsedMs = performance.now() - started;
  return {
    concurrency,
    requests: timings.length,
    errors,
    elapsedMs,
    requestsPerSecond: timings.length / (elapsedMs / 1000),
    p50Ms: timings[Math.floor((timings.length - 1) * 0.5)],
    p95Ms: timings[Math.floor((timings.length - 1) * 0.95)],
    p99Ms: timings[Math.floor((timings.length - 1) * 0.99)],
  };
}
/** Start an isolated local process and collect server-side resource samples.
 * @returns {Promise<void>} Measurement completion.
 */
async function run() {
  const child = fork(
    new URL("../integration/worker.mjs", import.meta.url),
    [],
    { silent: true },
  );
  try {
    const [ready] = await once(child, "message", {
      signal: AbortSignal.timeout(15000),
    });
    for (const concurrency of [10, 50, 100]) {
      const result = await measure(
        `${ready.url}/api/health/ready`,
        concurrency,
        300,
      );
      const metrics = once(child, "message", {
        signal: AbortSignal.timeout(5000),
      });
      child.send({ type: "metrics" });
      const [resources] = await metrics;
      process.stdout.write(
        JSON.stringify({ workload: "readiness probes", ...result, resources }) +
          "\n",
      );
    }
  } finally {
    if (child.exitCode === null) {
      child.send({ type: "stop" });
      try {
        await once(child, "exit", { signal: AbortSignal.timeout(18000) });
      } catch {
        child.kill();
      }
    }
  }
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  await run();
