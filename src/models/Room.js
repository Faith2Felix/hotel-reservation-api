import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },

    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },

    roomType: {
      type: String,
      required: true,
      enum: ["single", "double", "twin", "deluxe", "suite", "family"],
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    amenities: {
      type: [String],
      default: [],
    },

    images: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["available", "maintenance", "inactive"],
      default: "available",
    },
  },
  { timestamps: true },
);

// Prevent duplicate room numbers within the same hotel.
roomSchema.index({ hotel: 1, roomNumber: 1 }, { unique: true });

const Room = mongoose.model("Room", roomSchema);

export default Room;
