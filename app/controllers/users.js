/**
 * @module app/controllers/users
 * @description User authentication and CRUD controller methods.
 */

const db = require("../models");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const hash = require("./hash");

/**
 * @typedef {Object} AuthenticatedRequest
 * @property {Object} [user] - Authenticated token payload.
 * @property {string} [user.id] - User id.
 * @property {string} [user.email] - User email.
 * @property {string} [user.role] - User role.
 */

/**
 * @typedef {{ id: string, email: string, role: string }} TokenPayload
 */

const EMAIL_FORMAT = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

/**
 * Sign a short-lived JWT access token.
 * @param {TokenPayload} payload - Claims to include in the token.
 * @returns {string} Signed access token.
 */
function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  });
}

/**
 * Sign a long-lived JWT refresh token.
 * @param {TokenPayload} payload - Claims to include in the token.
 * @returns {string} Signed refresh token.
 */
function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  });
}

/**
 * Attach refresh token as an HTTP-only cookie.
 * @param {Object} res - Express response.
 * @param {string} token - Refresh token value.
 * @returns {void}
 */
function setRefreshCookie(res, token) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/users",
  });
}

/**
 * Build token payload from a user record.
 * @param {{ _id: string, email: string, role: string }} user - User document.
 * @returns {TokenPayload} Token claims.
 */
function buildPayload(user) {
  return {
    id: String(user._id),
    email: user.email,
    role: user.role,
  };
}

/**
 * Return all users matching query params.
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 * @returns {Promise<void>}
 */
async function findAll(req, res) {
  try {
    const users = await db.User.find(req.query);
    res.json(users);
  } catch (error) {
    res.status(422).json(error);
  }
}

/**
 * Return a user by id.
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 * @returns {Promise<void>}
 */
async function findById(req, res) {
  try {
    const user = await db.User.findById(req.params.id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(422).json(error);
  }
}

/**
 * Register a new user and return an access token.
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 * @returns {Promise<void>}
 */
async function register(req, res) {
  try {
    const { name, username, email, password, phone_num, role } = req.body;

    if (!email || !password || !name || !username) {
      res
        .status(400)
        .json({ message: "name, username, email, and password are required" });
      return;
    }

    if (!EMAIL_FORMAT.test(email)) {
      res.status(400).json({ message: "Invalid email format" });
      return;
    }

    const existing = await db.User.findOne({ email });
    if (existing) {
      res.status(409).json({ message: "Email already in use" });
      return;
    }

    const user = await db.User.create({
      name,
      username,
      email,
      password: hash.hashThis(password),
      phone_num,
      role: role || "user",
      createdAt: moment().format("dddd, MMMM Do YYYY, h:mm:ss a"),
    });

    const payload = buildPayload(user);
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    setRefreshCookie(res, refreshToken);
    res.status(201).json({ token: accessToken });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
}

/**
 * Legacy alias for register endpoint behavior.
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 * @returns {Promise<void>}
 */
function create(req, res) {
  return register(req, res);
}

/**
 * Update a user by id.
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 * @returns {Promise<void>}
 */
async function update(req, res) {
  try {
    const { password, ...rest } = req.body;
    const updateData = { ...rest };

    if (password) {
      updateData.password = hash.hashThis(password);
    }

    updateData.updatedAt = moment().format("dddd, MMMM Do YYYY, h:mm:ss a");

    const user = await db.User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Update failed" });
  }
}

/**
 * Delete a user by id.
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 * @returns {Promise<void>}
 */
async function remove(req, res) {
  try {
    const user = await db.User.findById(req.params.id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    await user.remove();
    res.json(user);
  } catch (error) {
    console.error("Remove user error:", error);
    res.status(500).json({ message: "Delete failed" });
  }
}

/**
 * Authenticate a user and return an access token.
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 * @returns {Promise<void>}
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await db.User.findOne({ email });

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await hash.compareHash(password, user.password);

    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const payload = buildPayload(user);
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    setRefreshCookie(res, refreshToken);
    res.json({ token: accessToken });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
}

/**
 * Refresh the access token using the refresh cookie.
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 * @returns {void}
 */
function refreshToken(req, res) {
  const token = req.cookies.refreshToken;

  if (!token) {
    res.status(401).json({ message: "No refresh token" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const payload = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    const accessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken(payload);

    setRefreshCookie(res, newRefreshToken);
    res.json({ token: accessToken });
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(403).json({ message: "Invalid refresh token" });
  }
}

/**
 * Clear the refresh token cookie.
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 * @returns {void}
 */
function logout(req, res) {
  res.clearCookie("refreshToken", { path: "/api/users" });
  res.status(200).json({ message: "Logged out" });
}

/**
 * Return the currently authenticated user payload from middleware.
 * @param {AuthenticatedRequest} req - Express request.
 * @param {Object} res - Express response.
 * @returns {void}
 */
function currentUser(req, res) {
  if (!req.user) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  res.json({ user: req.user });
}

module.exports = {
  findAll,
  findById,
  register,
  create,
  update,
  remove,
  login,
  refreshToken,
  logout,
  currentUser,
};

