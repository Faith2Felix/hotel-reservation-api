import express from "express";

import {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
} from "../controllers/roomController.js";

import { validateRoom } from "../middlewares/validateRoom.js";

const router = express.Router();

// Create a room
router.post("/", validateRoom, createRoom);

// Get all rooms
router.get("/", getAllRooms);

// Get a single room
router.get("/:id", getRoomById);

// Update a room
router.patch("/:id", validateRoom, updateRoom);

// Delete a room
router.delete("/:id", deleteRoom);

export default router;
