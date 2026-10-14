
import Reservation from "../models/reservationModel.js";

// Create a new reservation
export const createReservation = async (req, res) => {
  try {
    const {
      hotel,
      room,
      checkInDate,
      checkOutDate,
      numberOfGuests,
    } = req.body;

    // Validate required fields
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

    // Validate guest count
    const guests = Number(numberOfGuests);

    if (!Number.isInteger(guests) || guests < 1) {
      return res.status(400).json({
        message: "Number of guests must be a positive whole number.",
      });
    }

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (
      Number.isNaN(checkIn.getTime()) ||
      Number.isNaN(checkOut.getTime())
    ) {
      return res.status(400).json({
        message: "Please provide valid check-in and check-out dates.",
      });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({
        message: "Check-out must be after check-in.",
      });
    }

    if (checkIn < new Date()) {
      return res.status(400).json({
        message: "Check-in cannot be in the past.",
      });
    }

    // Calculate the number of nights using calendar dates
    const checkInDay = Date.UTC(
      checkIn.getUTCFullYear(),
      checkIn.getUTCMonth(),
      checkIn.getUTCDate()
    );

    const checkOutDay = Date.UTC(
      checkOut.getUTCFullYear(),
      checkOut.getUTCMonth(),
      checkOut.getUTCDate()
    );

    const numberOfNights = (checkOutDay - checkInDay) / 86400000;

    // Availability, room capacity and room price must be
    // verified against the actual Room model before saving.
    return res.status(501).json({
      message:
        "Date validation passed. Room and availability integration is the next step.",
      numberOfNights,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to process reservation.",
      error: error.message,
    });
  }
};


// Get all reservations (temporary development endpoint)
export const getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .sort({ createdAt: -1 });

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

// Get one reservation by ID
export const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        message: "Reservation not found.",
      });
    }

    return res.status(200).json({ reservation });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid reservation ID.",
      });
    }

    console.error("Get reservation error:", error);

    return res.status(500).json({
      message: "Failed to retrieve reservation.",
    });
  }
};

export const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

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
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid reservation ID.",
      });
    }

    console.error("Cancel reservation error:", error);

    return res.status(500).json({
      message: "Failed to cancel reservation.",
    });
  }
};

