/**
 * @module scripts/admin/promote-user
 * @description Explicit one-time workflow for promoting an existing account to administrator.
 */

import process from "node:process";
import { pathToFileURL } from "node:url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../../app/models/users.js";

dotenv.config({ quiet: true });

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate the explicit environment contract for an administrator promotion.
 *
 * @param {Record<string, string|undefined>} environment - Environment mapping.
 * @returns {{email: string, mongodbUri: string}} Promotion settings.
 * @throws {Error} When confirmation or required values are invalid.
 */
export function readPromotionConfig(environment) {
  if (environment.ALLOW_ADMIN_PROMOTION !== "true") {
    throw new Error("ALLOW_ADMIN_PROMOTION=true is required");
  }
  if (!environment.MONGODB_URI) {
    throw new Error("MONGODB_URI is required");
  }

  const email = environment.ADMIN_EMAIL?.trim().toLowerCase() || "";
  if (!EMAIL_PATTERN.test(email)) {
    throw new Error("ADMIN_EMAIL must be a valid existing account email");
  }

  return { email, mongodbUri: environment.MONGODB_URI };
}

/**
 * Promote an existing account while preserving all other user fields.
 *
 * @param {{email: string, mongodbUri: string}} config - Validated promotion settings.
 * @returns {Promise<Object>} Updated public user document.
 * @throws {Error} When no matching account exists.
 */
export async function promoteUser(config) {
  await mongoose.connect(config.mongodbUri);
  try {
    const user = await User.findOneAndUpdate(
      { email: config.email },
      { $set: { role: "admin" } },
      { new: true, runValidators: true },
    ).select("name username email role updatedAt");

    if (!user) {
      throw new Error("No account matches ADMIN_EMAIL");
    }

    return user;
  } finally {
    await mongoose.disconnect();
  }
}

/**
 * Execute the guarded promotion command and set a process exit status.
 *
 * @returns {Promise<void>}
 */
async function runCommand() {
  try {
    const config = readPromotionConfig(process.env);
    const user = await promoteUser(config);
    process.stdout.write(`Promoted ${user.email} to admin.\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

const isMainModule =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMainModule) {
  void runCommand();
}
