import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import Reservation from "../models/Reservation.js";

// Search hotels by location or name
export const searchHotels = async (req, res) => {
  try {
    const { location, name } = req.query;

    const filter = {};

    if (location) {
      const locationRegex = new RegExp(location, "i");

      filter.$or = [
        { city: locationRegex },
        { country: locationRegex },
        { address: locationRegex },
      ];
    }

    if (name) {
      filter.name = new RegExp(name, "i");
    }

    const hotels = await Hotel.find(filter);

    return res.status(200).json({
      success: true,
      count: hotels.length,
      data: hotels,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to search hotels",
    });
  }
};

// Search rooms and check their availability
export const searchRooms = async (req, res) => {
  try {
    const {
      hotelId,
      location,
      roomType,
      minPrice,
      maxPrice,
      guests,
      checkIn,
      checkOut,
    } = req.query;

    const roomFilter = {
      status: { $nin: ["maintenance", "inactive"] },
    };

    if (hotelId) {
      roomFilter.hotel = hotelId;
    }

    if (roomType) {
      roomFilter.roomType = new RegExp(`^${roomType}$`, "i");
    }

    if (guests) {
      roomFilter.capacity = { $gte: Number(guests) };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      roomFilter.pricePerNight = {};

      if (minPrice !== undefined) {
        roomFilter.pricePerNight.$gte = Number(minPrice);
      }

      if (maxPrice !== undefined) {
        roomFilter.pricePerNight.$lte = Number(maxPrice);
      }
    }

    // Filter rooms by hotel location when supplied.
    if (location) {
      const matchingHotels = await Hotel.find({
        $or: [
          { city: new RegExp(location, "i") },
          { country: new RegExp(location, "i") },
          { address: new RegExp(location, "i") },
        ],
      }).select("_id");

      roomFilter.hotel = {
        $in: matchingHotels.map((hotel) => hotel._id),
      };
    }

    const rooms = await Room.find(roomFilter).populate(
      "hotel",
      "name address city country"
    );

    // If dates aren't supplied, return matching rooms
    // without claiming they are available for a specific stay.
    if (!checkIn && !checkOut) {
      return res.status(200).json({
        success: true,
        count: rooms.length,
        data: rooms,
      });
    }

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    // Find existing reservations that overlap the requested stay.
    const overlappingReservations = await Reservation.find({
      status: { $nin: ["cancelled"] },
      checkIn: { $lt: endDate },
      checkOut: { $gt: startDate },
    }).select("room");

    const bookedRoomIds = overlappingReservations.map(
      (reservation) => String(reservation.room)
    );

    const availableRooms = rooms.filter(
      (room) => !bookedRoomIds.includes(String(room._id))
    );

    return res.status(200).json({
      success: true,
      count: availableRooms.length,
      checkIn,
      checkOut,
      data: availableRooms,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to search room availability",
    });
  }
};
