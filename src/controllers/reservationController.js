import mongoose from "mongoose";
import Reservation from "../models/reservationModel.js";
import Room from "../models/Room.js";

// Create a reservation
export const createReservation = async (req, res) => {
  try {
    const { hotel, room, checkInDate, checkOutDate, numberOfGuests } = req.body;

    if (
      !hotel ||
      !room ||
      !checkInDate ||
      !checkOutDate ||
      numberOfGuests === undefined
    ) {
      return res.status(400).json({
        message: "Please provide all required reservation details.",
      });
    }

    if (!mongoose.isValidObjectId(hotel) || !mongoose.isValidObjectId(room)) {
      return res.status(400).json({
        message: "Invalid hotel or room ID.",
      });
    }

    const guests = Number(numberOfGuests);

    if (!Number.isInteger(guests) || guests < 1) {
      return res.status(400).json({
        message: "Number of guests must be a positive whole number.",
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      return res.status(400).json({
        message: "Please provide valid check-in and check-out dates.",
      });
    }

    const checkInDay = Date.UTC(
      checkIn.getUTCFullYear(),
      checkIn.getUTCMonth(),
      checkIn.getUTCDate(),
    );

    const checkOutDay = Date.UTC(
      checkOut.getUTCFullYear(),
      checkOut.getUTCMonth(),
      checkOut.getUTCDate(),
    );

    const today = new Date();
    const todayDay = Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
    );

    if (checkInDay < todayDay) {
      return res.status(400).json({
        message: "Check-in cannot be in the past.",
      });
    }

    if (checkOutDay <= checkInDay) {
      return res.status(400).json({
        message: "Check-out must be after check-in.",
      });
    }

    const numberOfNights = (checkOutDay - checkInDay) / 86400000;

    // Verify the actual room
    const selectedRoom = await Room.findById(room);

    if (!selectedRoom) {
      return res.status(404).json({
        message: "Room not found.",
      });
    }

    if (String(selectedRoom.hotel) !== String(hotel)) {
      return res.status(400).json({
        message: "The selected room does not belong to this hotel.",
      });
    }

    if (selectedRoom.status !== "available") {
      return res.status(400).json({
        message: "This room is not available for booking.",
      });
    }

    if (selectedRoom.capacity < guests) {
      return res.status(400).json({
        message: "The room capacity is insufficient for your guests.",
      });
    }

    // Check for overlapping active reservations
    const overlappingReservation = await Reservation.findOne({
      room: selectedRoom._id,
      status: { $in: ["pending", "confirmed"] },
      checkInDate: { $lt: new Date(checkOutDay) },
      checkOutDate: { $gt: new Date(checkInDay) },
    });

    if (overlappingReservation) {
      return res.status(409).json({
        message: "This room is already reserved for those dates.",
      });
    }

    // Calculate the price using the database room price
    const pricePerNight = selectedRoom.pricePerNight;
    const totalAmount = pricePerNight * numberOfNights;

    if (
      !Number.isFinite(pricePerNight) ||
      pricePerNight <= 0 ||
      !Number.isFinite(totalAmount)
    ) {
      return res.status(400).json({
        message: "The room price is invalid.",
      });
    }

    const reservation = await Reservation.create({
      customer: req.user._id,
      hotel: selectedRoom.hotel,
      room: selectedRoom._id,
      checkInDate: new Date(checkInDay),
      checkOutDate: new Date(checkOutDay),
      numberOfGuests: guests,
      numberOfNights,
      pricePerNight,
      totalAmount,
      status: "pending",
    });

    return res.status(201).json({
      message: "Reservation created successfully.",
      reservation,
    });
  } catch (error) {
    console.error("Create reservation error:", error);

    return res.status(500).json({
      message: "Failed to create reservation.",
    });
  }
};

// Get reservations belonging to the authenticated customer.
// Admins can view all reservations.
export const getReservations = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { customer: req.user._id };

    const reservations = await Reservation.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      count: reservations.length,
      reservations,
    });
  } catch (error) {
    console.error("Get reservations error:", error);

    return res.status(500).json({
      message: "Failed to retrieve reservations.",
    });
  }
};

// Get one reservation, with ownership verification
export const getReservationById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid reservation ID.",
      });
    }

    const filter =
      req.user.role === "admin"
        ? { _id: req.params.id }
        : {
            _id: req.params.id,
            customer: req.user._id,
          };

    const reservation = await Reservation.findOne(filter);

    if (!reservation) {
      return res.status(404).json({
        message: "Reservation not found.",
      });
    }

    return res.status(200).json({ reservation });
  } catch (error) {
    console.error("Get reservation error:", error);

    return res.status(500).json({
      message: "Failed to retrieve reservation.",
    });
  }
};

// Cancel a reservation, with ownership verification
export const cancelReservation = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid reservation ID.",
      });
    }

    const filter =
      req.user.role === "admin"
        ? { _id: req.params.id }
        : {
            _id: req.params.id,
            customer: req.user._id,
          };

    const reservation = await Reservation.findOne(filter);

    if (!reservation) {
      return res.status(404).json({
        message: "Reservation not found.",
      });
    }

    if (reservation.status === "cancelled") {
      return res.status(400).json({
        message: "This reservation is already cancelled.",
      });
    }

    if (reservation.status === "completed") {
      return res.status(400).json({
        message: "A completed reservation cannot be cancelled.",
      });
    }

    reservation.status = "cancelled";
    await reservation.save();

    return res.status(200).json({
      message: "Reservation cancelled successfully.",
      reservation,
    });
  } catch (error) {
    console.error("Cancel reservation error:", error);

    return res.status(500).json({
      message: "Failed to cancel reservation.",
    });
  }
};
