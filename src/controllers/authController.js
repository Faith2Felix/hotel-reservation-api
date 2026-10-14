import crypto from "node:crypto";
import User from "../models/User.js";
import { sendAuthResponse } from "../middlewares/token.js";

// Checks that the password is at least 8 characters and includes a letter and a number.
const isStrongPassword = (p) =>
  typeof p === "string" && p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);

// Comparing the provided admin key and stored admin key
const safeEqual = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

// Customer registration POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required.",
      });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and contain a letter and a number.",
      });
    }

    // role is deliberately NOT read from the body (prevents privilege escalation)
    const user = await User.create({ name, email, password, phone });
    sendAuthResponse(user, 201, res);
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal Server error",
    });
  }
};

// POST /api/auth/register-admin  (requires ADMIN_SIGNUP_KEY) -> creates an ADMIN
// Body: { name, email, password, phone?, adminKey }. Use it for as many admins as needed.
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, adminKey } = req.body;

    if (!process.env.ADMIN_SIGNUP_KEY) {
      return res.status(503).json({
        message: "Admin registration is not configured.",
      });
    }

    if (!adminKey || !safeEqual(adminKey, process.env.ADMIN_SIGNUP_KEY)) {
      return res.status(403).json({
        message: "Invalid admin key.",
      });
    }

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required.",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and contain a letter and a number.",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: "admin",
    });
    sendAuthResponse(user, 201, res);
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal Server error",
    });
  }
};

// POST /api/auth/login  (public)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: String(email).toLowerCase(),
    }).select("+password");

    // Same message for unknown email / wrong password to avoid user enumeration
    if (!user || !(await user.comparePassword(String(password)))) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }
    if (!user.isActive) {
      return res.status(403).json({
        message: "This account has been deactivated.",
      });
    }

    sendAuthResponse(user, 200, res);
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// GET /api/auth/me  (protected)
export const me = (req, res) => res.json({ success: true, user: req.user });
