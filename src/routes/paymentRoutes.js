import express from "express";

import {
  createPayment,
  getPaymentById,
  getPaymentHistory,
} from "../controllers/paymentController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a simulated payment
router.post("/", protect, createPayment);

// View the authenticated user's payment history
router.get("/history", protect, getPaymentHistory);

// View a specific payment
router.get("/:id", protect, getPaymentById);

export default router;
