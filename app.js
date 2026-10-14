import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";

import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import hotelRoute from "./src/routes/hotelRoute.js";
import roomRoutes from "./src/routes/roomRoutes.js";
import reservationRoutes from "./src/routes/reservationRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import availabilityRoutes from "./src/routes/availabilityRoutes.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Base route
app.get("/", (req, res) => {
  res.json({
    message: "Hotel Reservation API is running",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/hotels", hotelRoute);
app.use("/api/rooms", roomRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/availability", availabilityRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

export default app;
