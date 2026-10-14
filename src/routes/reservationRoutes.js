import express from "express";
import {
  createReservation,
  getReservations,
  getReservationById,
  cancelReservation,
} from "../controllers/reservationController.js";

import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", protect, createReservation);
router.get("/", protect, getReservations);
router.get("/:id", protect, getReservationById);
router.patch("/:id/cancel", protect, cancelReservation);

export default router;
