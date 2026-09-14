/**
 * @module app/controllers/users.test
 * @description Focused tests for secure user-controller data and session behavior.
 */

const assert = require("node:assert/strict");
const { afterEach, before, describe, it, mock } = require("node:test");
const db = require("../models");
const hash = require("./hash");

const originalUserModel = db.User;

/**
 * Create a minimal chainable Express response double.
 *
 * @returns {Object} Response double with captured status, body, and cookies.
 */
function createResponse() {
  return {
    body: undefined,
    cookies: [],
    statusCode: 200,
    clearedCookies: [],
    clearCookie(name, options) {
      this.clearedCookies.push({ name, options });
      return this;
    },
    cookie(name, value, options) {
      this.cookies.push({ name, value, options });
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
  };
}

describe("user controller", () => {
  let controller;

  before(() => {
    process.env.JWT_ACCESS_SECRET =
      "test-access-secret-with-at-least-thirty-two-bytes";
    process.env.JWT_REFRESH_SECRET =
      "test-refresh-secret-with-at-least-thirty-two-bytes";
    process.env.JWT_AUDIENCE = "test-client";
    process.env.JWT_ISSUER = "test-server";
    controller = require("./users");
  });

  afterEach(() => {
    db.User = originalUserModel;
    mock.restoreAll();
  });

  it("registers a public user without accepting a role override", async () => {
    let createdData;
    const createdUser = {
      _id: "507f1f77bcf86cd799439011",
      email: "avery@example.com",
      name: "Avery Example",
      role: "user",
      tokenVersion: 0,
      username: "avery",
      toJSON() {
        return {
          id: String(this._id),
          email: this.email,
          name: this.name,
          role: this.role,
          username: this.username,
        };
      },
    };
    db.User = {
      create: async (data) => {
        createdData = data;
        return createdUser;
      },
      findOne: async () => null,
    };
    mock.method(hash, "hashThis", async () => "secure-digest");
    const response = createResponse();

    await controller.register(
      {
        body: {
          email: "Avery@Example.com",
          name: "Avery Example",
          password: "correct horse battery staple",
          role: "admin",
          username: "avery",
        },
      },
      response,
    );

    assert.equal(response.statusCode, 201);
    assert.equal(createdData.role, "user");
    assert.equal(createdData.password, "secure-digest");
    assert.equal(response.body.user.role, "user");
    assert.equal(typeof response.body.token, "string");
    assert.equal(response.cookies[0].options.httpOnly, true);
    assert.equal(response.cookies[0].options.sameSite, "strict");
  });

  it("lets an admin create a role without replacing the admin session", async () => {
    let createdData;
    const createdUser = {
      _id: "507f1f77bcf86cd799439012",
      email: "admin-created@example.com",
      name: "Created Admin",
      role: "admin",
      tokenVersion: 0,
      username: "created.admin",
      toJSON() {
        return { id: String(this._id), email: this.email, role: this.role };
      },
    };
    db.User = {
      create: async (data) => {
        createdData = data;
        return createdUser;
      },
      findOne: async () => null,
    };
    mock.method(hash, "hashThis", async () => "secure-digest");
    const response = createResponse();

    await controller.create(
      {
        body: {
          email: "admin-created@example.com",
          name: "Created Admin",
          password: "correct horse battery staple",
          role: "admin",
          username: "created.admin",
        },
        user: { id: "existing-admin", role: "admin" },
      },
      response,
    );

    assert.equal(response.statusCode, 201);
    assert.equal(createdData.role, "admin");
    assert.equal(response.body.user.role, "admin");
    assert.equal(response.body.token, undefined);
    assert.equal(response.cookies.length, 0);
  });

  it("allowlists and bounds user-list queries", async () => {
    const captured = {};
    const query = {
      select(value) {
        captured.select = value;
        return this;
      },
      sort(value) {
        captured.sort = value;
        return this;
      },
      skip(value) {
        captured.skip = value;
        return this;
      },
      limit(value) {
        captured.limit = value;
        return this;
      },
      lean() {
        return Promise.resolve([{ email: "user@example.com" }]);
      },
    };
    db.User = {
      countDocuments: async (filter) => {
        captured.countFilter = filter;
        return 1;
      },
      find(filter) {
        captured.filter = filter;
        return query;
      },
    };
    const response = createResponse();

    await controller.findAll(
      {
        query: {
          email: "USER@EXAMPLE.COM",
          limit: "500",
          password: { $exists: true },
        },
      },
      response,
    );

    assert.deepEqual(captured.filter, { email: "user@example.com" });
    assert.deepEqual(captured.countFilter, captured.filter);
    assert.equal(captured.limit, 100);
    assert.equal(captured.skip, 0);
    assert.match(captured.select, /email/);
    assert.equal(response.body.pagination.total, 1);
  });

  it("rotates refresh sessions and rejects a stale token version", async () => {
    const { signRefreshToken } = require("../utils/tokens");
    const sessionUser = {
      _id: "507f1f77bcf86cd799439011",
      email: "user@example.com",
      role: "user",
      tokenVersion: 3,
      async save() {
        return this;
      },
    };
    db.User = {
      findById() {
        return {
          select: async () => sessionUser,
        };
      },
    };
    const response = createResponse();
    const refreshToken = signRefreshToken(sessionUser);

    await controller.refreshToken({ cookies: { refreshToken } }, response);

    assert.equal(sessionUser.tokenVersion, 4);
    assert.equal(typeof response.body.token, "string");
    assert.equal(response.cookies.length, 1);

    const staleResponse = createResponse();
    await controller.refreshToken({ cookies: { refreshToken } }, staleResponse);
    assert.equal(staleResponse.statusCode, 403);
  });
});
