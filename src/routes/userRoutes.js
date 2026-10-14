import express from "express";
import * as c from "../controllers/userController.js";
import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

router.use(protect); // everything below requires login

// Own profile (customer + admin). NOTE: /me routes must come before /:id
router
  .route("/me")
  .get(c.getProfile)
  .put(c.updateProfile)
  .delete(c.deactivateMe);
router.put("/me/password", c.changePassword);

// Admin only
router.use(authorize("admin"));
router.get("/", c.getAllUsers);
router.get("/:id", c.getUserById);
router.put("/:id/role", c.updateUserRole);
router.delete("/:id", c.deactivateUser);

export default router;
