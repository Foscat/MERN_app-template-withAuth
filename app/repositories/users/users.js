/** @module app/repositories/users
 * @description Explicit, bounded account persistence operations. Caller input never becomes a raw query.
 */
const mongoose = require("mongoose");
const { User } = require("../../models/index.js");
/**
 * Create an account repository with bounded query execution.
 * @param {Object} [options] Persistence dependencies.
 * @param {Object} [options.model] User model.
 * @param {number} [options.queryTimeoutMs] Maximum query time.
 * @returns {Object} Account persistence interface.
 */
function createUserRepository({ model = User, queryTimeoutMs = 5000 } = {}) {
  /** Apply trusted constructed-query options.
   * @param {Object} query Query.
   * @returns {Object} Bounded query. */
  const bounded = (query) =>
    query.setOptions({ sanitizeFilter: false }).maxTimeMS(queryTimeoutMs);
  return {
    /** Read account credentials at the authentication boundary.
     * @param {string} email Normalized address.
     * @returns {Promise<Object|null>} Account. */
    byEmail: (email) =>
      bounded(model.findOne({ email })).select("+password +tokenVersion"),
    /** Look up an account by identifier.
     * @param {string} id Identifier.
     * @returns {Promise<Object|null>} Account. */
    byId: (id) => bounded(model.findById(id)).select("+tokenVersion"),
    /** Insert validated account fields.
     * @param {Object} fields Validated fields.
     * @returns {Promise<Object>} Account. */
    create: (fields) => model.create(fields),
    /** Update validated fields atomically.
     * @param {string} id Identifier.
     * @param {Object} changes Validated changes.
     * @returns {Promise<Object|null>} Updated account. */
    update: (id, changes) =>
      bounded(
        model.findByIdAndUpdate(
          id,
          {
            $set: changes,
            ...(changes.password ? { $inc: { tokenVersion: 1 } } : {}),
          },
          { returnDocument: "after", runValidators: true },
        ),
      ).select("+tokenVersion"),
    /** Delete one account.
     * @param {string} id Identifier.
     * @returns {Promise<Object|null>} Removed account. */
    remove: (id) => bounded(model.findByIdAndDelete(id)),
    /** Read a stable page without counting in cursor mode.
     * @param {Object} options Validated paging.
     * @returns {Promise<Object>} Page. */
    async list({ filter, limit, skip, cursor }) {
      const query = { ...filter };
      if (cursor?.after) {
        const { createdAt, id } = cursor.after;
        query.$or = [
          { createdAt: { $lt: new Date(createdAt) } },
          {
            createdAt: new Date(createdAt),
            _id: { $lt: new mongoose.Types.ObjectId(id) },
          },
        ];
      }
      const users = await bounded(model.find(query))
        .select("name username email phoneNumber role createdAt updatedAt")
        .sort({ createdAt: -1, _id: -1 })
        .skip(cursor ? 0 : skip)
        .limit(limit + (cursor ? 1 : 0))
        .lean();
      return {
        users,
        total: cursor ? undefined : await bounded(model.countDocuments(filter)),
      };
    },
  };
}
module.exports = { createUserRepository };
