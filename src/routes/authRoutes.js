import express from "express";
import {
  register,
  registerAdmin,
  login,
  me,
} from "../controllers/authController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/register-admin", registerAdmin);
router.post("/login", login);
router.get("/me", protect, me);

export default router;
