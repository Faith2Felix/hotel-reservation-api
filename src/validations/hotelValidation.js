import { z } from "zod";

export const createHotelSchema = z.object({
  name: z.string().trim().min(1, "Hotel name is required"),
  description: z.string().trim().min(1, "Description is required"),
  street: z.string().trim().min(1, "Street is required"),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  country: z.string().trim().min(1, "Country is required"),
  postalCode: z.string().trim().optional(),
  amenities: z.array(z.string().trim()).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s()-]{7,20}$/, "Invalid Phone Number"),

  email: z.email("Invalid email address").trim(),
});
