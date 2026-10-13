const allowedRoomTypes = [
  "single",
  "double",
  "twin",
  "deluxe",
  "suite",
  "family",
];

const allowedRoomStatuses = ["available", "maintenance", "inactive"];

export const validateRoom = (req, res, next) => {
  const { hotel, roomNumber, roomType, pricePerNight, capacity, status } =
    req.body;

  // Validate required fields when creating a room
  if (req.method === "POST") {
    if (
      !hotel ||
      !roomNumber ||
      !roomType ||
      pricePerNight === undefined ||
      capacity === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Hotel, room number, room type, price per night, and capacity are required.",
      });
    }
  }

  // Validate room number
  if (roomNumber !== undefined) {
    if (typeof roomNumber !== "string" || !roomNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: "Room number must be a non-empty string.",
      });
    }
  }

  // Validate room type
  if (roomType !== undefined && !allowedRoomTypes.includes(roomType)) {
    return res.status(400).json({
      success: false,
      message: `Room type must be one of: ${allowedRoomTypes.join(", ")}.`,
    });
  }

  // Validate price
  if (pricePerNight !== undefined) {
    if (
      typeof pricePerNight !== "number" ||
      !Number.isFinite(pricePerNight) ||
      pricePerNight < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Price per night must be a non-negative number.",
      });
    }
  }

  // Validate capacity
  if (capacity !== undefined) {
    if (!Number.isInteger(capacity) || capacity < 1) {
      return res.status(400).json({
        success: false,
        message: "Capacity must be a positive whole number.",
      });
    }
  }

  // Validate status
  if (status !== undefined && !allowedRoomStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Status must be one of: ${allowedRoomStatuses.join(", ")}.`,
    });
  }

  // Validate amenities and images
  for (const field of ["amenities", "images"]) {
    if (
      req.body[field] !== undefined &&
      (!Array.isArray(req.body[field]) ||
        !req.body[field].every((item) => typeof item === "string"))
    ) {
      return res.status(400).json({
        success: false,
        message: `${field} must be an array of strings.`,
      });
    }
  }

  next();
};
