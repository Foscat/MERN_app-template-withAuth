/** @module app/models/sessions
 * @description Shared device-session records. Expiry is enforced by services as well as TTL cleanup.
 */
const mongoose = require("mongoose");
/** Session schema; raw refresh credentials are never persisted.
 * @type {mongoose.Schema} */
const schema = new mongoose.Schema(
  {
    _id: { type: String },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    tokenVersion: { type: Number, required: true },
    generation: { type: Number, required: true, default: 0 },
    refreshHash: { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true },
    rotatedAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true, strict: "throw" },
);
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
schema.index({ userId: 1, revokedAt: 1, expiresAt: 1 });
module.exports = mongoose.model("Session", schema);
