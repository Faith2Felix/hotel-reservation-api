import mongoose from "mongoose";
import User, { ROLES } from "../models/User.js";
import { sendAuthResponse } from "../middleware/token.js";

// ---------- Own profile (any logged-in user) ----------

// GET /api/users/me
export const getProfile = (req, res) => res.json({ success: true, user: req.user });

// PUT /api/users/me   (only name, phone, email are editable here)
export const updateProfile = async (req, res) => {
  try {
    const id = req.user._id;
    const {name, phone, email} = req.body;


    const user = await User.findByIdAndUpdate(id, {
      name, phone, email,
    }, {new: true, runValidators: true});
    return res.status(200).json({
       message: "Profile updated successfully",
       data: user
      });

  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal Server error"
    });
  }
};

// PUT /api/users/me/password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
          message: "currentPassword and newPassword are required.",
        });
    }
    if (
      typeof newPassword !== "string" ||
      newPassword.length < 8 ||
      !/[A-Za-z]/.test(newPassword) ||
      !/\d/.test(newPassword)
    ) {
      return res.status(400).json({
          message:
            "New password must be at least 8 characters and contain a letter and a number.",
        });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.comparePassword(String(currentPassword)))) {
      return res.status(401).json({
        message: "Current password is incorrect." });
    }

    user.password = newPassword; // hashed by pre-save hook
    await user.save();
    sendAuthResponse(user, 200, res); // fresh token; old ones are invalidated
  } catch (error) {
    res.status(500).json({
      message: error.message || "Internal Server error" });
  }
};

// DELETE /api/users/me  (deactivate own account)
export const deactivateMe = async (req, res) => {
  try {
    const deleteMyProfile = await User.findByIdAndUpdate(req.user._id, { isActive: false });
    res.status(204).send();
  } catch (error) {
   return res.status(500).json({
    message: error.message || "Internal Server error" });
  }
};

// ---------- Admin only ----------

// GET /api/users?role=customer&page=1&limit=20
export const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 20, 1),
      100,
    );

    const filter = {};
    if (req.query.role && Object.values(ROLES).includes(req.query.role))
      filter.role = req.query.role;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter),
    ]);
    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Internal Server error"
    });
  }
};

// GET /api/users/:id
export const getUserById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid user id."
      });
    }

    const user = await User.findById(req.params.id);
    if (!user){
      return res.status(404).json({
        message: "User not found."
      });
    }

    return res.status(200).json({
      message: "user fetched successfully",
      data: user
    });

  } catch (error) {
   return res.status(500).json({
     message: error.message || "Internal Server error"
    });
  }
};

// PUT /api/users/:id/role   body: { role: "admin" | "customer" }
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid user id."
      });
    }

    if (!Object.values(ROLES).includes(role)) {
      return res.status(400).json({
          message: `Role must be one of: ${Object.values(ROLES).join(", ")}`,
        });
    }

    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({
        message: "You cannot change your own role."
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true },
    );
    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }
    return res.status(200).json({
      message: "User role updated successfully",
      data: user });

  } catch (error) {
      return res.status(500).json({
        message: error.message || "Internal Server error"
      });
  }
};

// Only the Admin can Deactivates another user's account without deleting their data e.g booking history.
export const deactivateUser = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid user id."
      });
    }

    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({
        message: "You cannot deactivate yourself."
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found." });
    }
    return res.status(200).json({
      message: "User deactivated Siccessfully.",
      data: user
    });

  } catch (error) {
    res.status(500).json({
      message: error.messaage || "Internal Server error" });
  }
};
