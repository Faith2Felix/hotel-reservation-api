
import express from "express";
import {
  createReservation,
  getReservations,
  getReservationById,
  cancelReservation,
} from "../controllers/reservationController.js";

const router = express.Router();

router.post("/", createReservation);
router.get("/", getReservations);
router.get("/:id", getReservationById);
router.patch("/:id/cancel", cancelReservation);

export default router;
