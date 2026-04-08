/**
 * @module app/models/users
 * @description Mongoose model for application users.
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * User schema for authentication and profile fields.
 * @type {mongoose.Schema}
 */
const userSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone_num: { type: Number },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  createdAt: { type: String, required: true },
  updatedAt: { type: String },
});

/**
 * User collection model.
 * @type {mongoose.Model}
 */
const User = mongoose.model("User", userSchema);

module.exports = User;
