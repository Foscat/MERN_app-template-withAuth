/** @module app/services/users
 * @description Account validation, credential handling, and public DTOs independent of HTTP.
 */
const bcrypt = require("bcrypt");
const { createUserRepository } = require("../../repositories/index.js");
const { createSessionService } = require("../sessions/sessions.js");
const {
  ValidationError,
  buildUserListFilter,
  validateRegistrationInput,
  validateLoginInput,
  validateUserUpdateInput,
} = require("../../utils/user-validation/user-validation.js");

/** Serialize only explicitly public fields.
 * @param {Object} user Account.
 * @returns {Object} Public DTO. */
function serializeUser(user) {
  const result = { id: String(user._id || user.id) };
  for (const key of [
    "name",
    "username",
    "email",
    "phoneNumber",
    "role",
    "createdAt",
    "updatedAt",
  ])
    if (user[key] !== undefined) result[key] = user[key];
  return result;
}
/** Require an existing account.
 * @param {Object|null} user Account.
 * @returns {Object} Account. */
function requireUser(user) {
  if (!user)
    throw Object.assign(new Error("User not found"), {
      statusCode: 404,
      code: "USER_NOT_FOUND",
    });
  return user;
}
/**
 * Compose the reusable user business service.
 * @param {Object} options Dependencies.
 * @param {Object} options.config Validated runtime settings.
 * @param {Object} [options.repository] Account persistence implementation.
 * @param {Object} [options.sessions] Shared session service.
 * @returns {Object} Account use cases.
 */
function createUserService({
  config,
  repository = createUserRepository({ queryTimeoutMs: config.queryTimeoutMs }),
  sessions = createSessionService({ config }),
}) {
  /** Create an account with explicitly controlled privileges.
   * @param {Object} body Input.
   * @param {boolean} [admin] Allow role assignment.
   * @returns {Promise<Object>} Account. */
  async function create(body, admin = false) {
    const input = validateRegistrationInput(body);
    const role =
      admin && body.role !== undefined
        ? validateUserUpdateInput({ role: body.role }, { allowRole: true }).role
        : "user";
    return repository.create({
      ...input,
      role,
      password: await bcrypt.hash(input.password, config.bcryptRounds),
    });
  }
  return {
    sessions,
    /** Register and issue an independent session.
     * @param {Object} body Input.
     * @returns {Promise<Object>} Session and account. */
    async register(body) {
      const user = await create(body);
      return { ...(await sessions.issue(user)), user: serializeUser(user) };
    },
    /** Create an account as an administrator.
     * @param {Object} body Input.
     * @returns {Promise<Object>} Public account. */
    async create(body) {
      return { user: serializeUser(await create(body, true)) };
    },
    /** Authenticate without invalidating other devices.
     * @param {Object} body Credentials.
     * @returns {Promise<Object>} Session. */
    async login(body) {
      const { email, password } = validateLoginInput(body);
      const user = await repository.byEmail(email);
      if (!user || !(await bcrypt.compare(password, user.password)))
        throw Object.assign(new Error("Invalid credentials"), {
          statusCode: 401,
          code: "INVALID_CREDENTIALS",
        });
      return { ...(await sessions.issue(user)), user: serializeUser(user) };
    },
    /** Return a public account.
     * @param {string} id Identifier.
     * @returns {Promise<Object>} DTO. */
    async findById(id) {
      return { user: serializeUser(requireUser(await repository.byId(id))) };
    },
    /** Validate and update an authorized account.
     * @param {string} id Identifier.
     * @param {Object} body Fields.
     * @param {Object} actor Principal.
     * @returns {Promise<Object>} DTO. */
    async update(id, body, actor) {
      const changes = validateUserUpdateInput(body, {
        allowRole: actor.role === "admin",
      });
      if (changes.password)
        changes.password = await bcrypt.hash(
          changes.password,
          config.bcryptRounds,
        );
      const user = requireUser(await repository.update(id, changes));
      return { user: serializeUser(user) };
    },
    /** Remove an account; authorization immediately rejects its remaining sessions.
     * @param {string} id Identifier.
     * @returns {Promise<Object>} Removed DTO. */
    async remove(id) {
      return { user: serializeUser(requireUser(await repository.remove(id))) };
    },
    /** List accounts using bounded offset or stable cursor pagination.
     * @param {Object} query Allowlisted input.
     * @returns {Promise<Object>} Page. */
    async findAll(query) {
      const paging = buildUserListFilter(query);
      if (paging.skip > 10000)
        throw new ValidationError(
          "Offset exceeds 10000; use cursor pagination",
        );
      if (query.cursor !== undefined) {
        paging.cursor = {};
        if (query.cursor !== "") {
          try {
            if (typeof query.cursor !== "string" || query.cursor.length > 512)
              throw new Error();
            const after = JSON.parse(
              Buffer.from(query.cursor, "base64url").toString(),
            );
            if (
              !/^[a-f\d]{24}$/iu.test(after.id) ||
              !Number.isFinite(Date.parse(after.createdAt))
            )
              throw new Error();
            paging.cursor.after = after;
          } catch {
            throw new ValidationError("Invalid pagination cursor");
          }
        }
      }
      const { users, total } = await repository.list(paging);
      const hasMore = Boolean(paging.cursor) && users.length > paging.limit;
      const visible = users.slice(0, paging.limit);
      const last = visible.at(-1);
      return {
        users: visible.map(serializeUser),
        pagination: paging.cursor
          ? {
              limit: paging.limit,
              nextCursor: hasMore
                ? Buffer.from(
                    JSON.stringify({
                      id: String(last._id),
                      createdAt: last.createdAt,
                    }),
                  ).toString("base64url")
                : null,
            }
          : { limit: paging.limit, skip: paging.skip, total },
      };
    },
  };
}
module.exports = { createUserService, serializeUser };
