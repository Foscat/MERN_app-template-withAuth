/**
 * @module app/models/users
 * @description Mongoose user model with credential redaction and native timestamps.
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * Remove internal authentication and persistence fields from serialized users.
 *
 * @param {mongoose.Document} document - Source document.
 * @param {Record<string, unknown>} result - Serializable object.
 * @returns {Record<string, unknown>} Public user representation.
 */
function redactPrivateFields(document, result) {
  void document;
  result.id = String(result._id);
  delete result._id;
  delete result.__v;
  delete result.password;
  delete result.tokenVersion;
  return result;
}

/** User schema for authentication and editable profile fields. @type {mongoose.Schema} */
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 40,
      match: /^[a-z0-9._-]+$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: { type: String, required: true, select: false },
    phoneNumber: { type: String, trim: true, maxlength: 30, default: null },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    tokenVersion: { type: Number, default: 0, min: 0, select: false },
  },
  {
    optimisticConcurrency: true,
    strict: true,
    timestamps: true,
    toJSON: { transform: redactPrivateFields, virtuals: true },
    toObject: { transform: redactPrivateFields, virtuals: true },
  },
);

/** User collection model. @type {mongoose.Model} */
const User = mongoose.model("User", userSchema);

module.exports = User;
