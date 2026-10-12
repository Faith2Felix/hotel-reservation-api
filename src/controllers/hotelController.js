import mongoose from "mongoose";
import Hotel from "../models/hotelModel.js";

// Create Hotel
export const createHotel = async (req, res, next) => {
  try {
    const {
      name,
      description,
      address,
      city,
      state,
      country,
      postalCode,
      amenities,
      phone,
      email,
    } = req.body;

    const hotel = await Hotel.create({
      name,
      description,
      address,
      city,
      state,
      country,
      postalCode,
      amenities,
      phone,
      email,
    });
    return res.status(201).json({
      success: true,
      message: "Hotel created successfully",
      data: hotel,
    });
  } catch (error) {
    return next(error);
  }
};

// Get Single Hotel by ID
export const getHotel = async (req, res, next) => {
  try {
    const { id } = req.params;

    // validate the hotel ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hotel ID",
      });
    }

    const hotel = await Hotel.findById(id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hotel fetched successfully",
      data: hotel,
    });
  } catch (error) {
    return next(error);
  }
};

// Get All Hotels
export const getAllHotel = async (req, res, next) => {
  try {
    const hotels = await Hotel.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: "Lists of all Hotels",
      count: hotels.length,
      data: hotels,
    });
  } catch (error) {
    return next(error);
  }
};

// update hotel by ID
export const updateHotel = async (req, res, next) => {
  try {
    const { id } = req.params;

    //validate the hotel ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hotel ID",
      });
    }

    const {
      name,
      description,
      address,
      city,
      state,
      country,
      postalCode,
      amenities,
      phone,
      email,
    } = req.body;

    const hotel = await Hotel.findByIdAndUpdate(
      id,
      {
        name,
        description,
        address,
        city,
        state,
        country,
        postalCode,
        amenities,
        phone,
        email,
      },
      { new: true },
    );

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hotel updated successfully",
      data: hotel,
    });
  } catch (error) {
    return next(error);
  }
};

// delete hotel by ID

export const deleteHotel = async (req, res, next) => {
  try {
    const { id } = req.params;

    //validate the hotel ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hotel ID",
      });
    }

    const hotel = await Hotel.findByIdAndDelete(id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Invalid Hotel ID",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hotel deleted successfully",
      data: hotel,
    });
  } catch (error) {
    return next(error);
  }
};
