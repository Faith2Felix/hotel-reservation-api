import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

/**
 * protect: verifies the Bearer token and attaches the user to req.user.
 * Usage: router.get('/x', protect, handler)
 */
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "User not authenticated. Please log in."
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    } catch (error) {
      const message =
        error.name === "TokenExpiredError"
          ? "Token expired. Please log in again."
          : "Invalid token. Please log in again.";
      return res.status(401).json({ message });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
          message:
            "The user for this token no longer exists or is deactivated.",
        });
    }

    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
          message: "Password was changed recently. Please log in again.",
        });
    }

    req.user = user;
    next();

  } catch (error) {
    res.status(500).json({
      message: error.message || "Internal server error"
    });
  }
};

/**
 * authorize: role-based access. Must run AFTER protect.
 * Usage: router.get('/x', protect, authorize('admin'), handler)
 */
const authorize = (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
          message: "You do not have permission to perform this action.",
        });
    }
    next();
  };



// Loads the resource and allows access only to its owner or an admin.
const restrictToOwnerOrAdmin =
  (Model, ownerField = "user", param = "id") =>
  async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params[param])) {
        return res.status(400).json({
          message: "Invalid id."
        });
      }

      const doc = await Model.findById(req.params[param]);
      if (!doc) {
        return res.status(404).json({
          message: "Resource not found."
        });
      }

      const isAdmin = req.user.role === "admin";
      const isOwner = String(doc[ownerField]) === String(req.user._id);
      if (!isAdmin && !isOwner) {
        return res.status(403).json({
            message: "You can only access your own resources.",
          });
      }
      req.resource = doc;
      next();

    } catch (error) {
      res.status(500).json({
        message: error.messsage || "Internal Server error" });
    }
  };

export { protect, authorize, restrictToOwnerOrAdmin };
