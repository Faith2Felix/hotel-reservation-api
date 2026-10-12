import express from "express";
import { validate } from "../middlewares/validate.js";
import {
  createHotel,
  getHotel,
  getAllHotel,
  updateHotel,
  deleteHotel,
} from "../controllers/hotelController.js";
import { createHotelSchema } from "../validations/hotelValidation.js";

const hotelRoute = express.Router();

//create an hotel
hotelRoute.post("/", validate(createHotelSchema), createHotel);
hotelRoute.get("/", getAllHotel);
hotelRoute.get("/:id", getHotel);
hotelRoute.patch("/:id", updateHotel);
hotelRoute.delete("/:id", deleteHotel);

export default hotelRoute;
