import express from "express";
import {
  searchHotels,
  searchRooms,
} from "../controllers/availabilityController.js";
import { validateAvailabilityQuery } from "../middlewares/validateAvailabityQuery.js";

const router = express.Router();

router.get("/hotels", searchHotels);
router.get("/rooms", validateAvailabilityQuery, searchRooms);

export default router;
