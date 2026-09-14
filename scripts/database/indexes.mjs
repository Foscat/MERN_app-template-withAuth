/** @module scripts/database/indexes
 * @description Explicit additive production index creation; never drops existing indexes.
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");
const { loadRuntimeConfig } = require("../../app/config/runtime/runtime.js");
const models = require("../../app/models/index.js");
const config = loadRuntimeConfig();
try {
  await mongoose.connect(config.mongodbUri, {
    autoIndex: false,
    serverSelectionTimeoutMS: config.dependencyTimeoutMs,
  });
  for (const model of Object.values(models)) await model.createIndexes();
  process.stdout.write(
    "Required indexes created without dropping existing indexes.\n",
  );
} finally {
  await mongoose.disconnect();
}
