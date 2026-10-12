import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hotel name is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Hotel description is required"],
      trim: true,
    },

    street: {
      type: String,
      required: [true, "Street address is required"],
      trim: true,
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },

    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },

    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },

    postalCode: {
      type: String,
      trim: true,
    },

    amenities: {
      type: [String],
      default: [],
    },

    phone: {
      type: String,
      required: [true, "Contact phone is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Contact email is required"],
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  },
);

const Hotel = mongoose.model("Hotel", hotelSchema);

export default Hotel;
