dotenv.config();
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import hotelRoute from "./src/routes/hotelRoute.js";
import reservationRoutes from "./src/routes/reservationRoutes.js";
import roomRoutes from "./src/routes/roomRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";

const app = express();
app.use("/api/rooms", roomRoutes);

app.use(cors());
app.use(express.json());
app.use("/api/reservations", reservationRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Hotel Reservation API is running",
  });
});

connectDB();

app.use("/api/hotels", hotelRoute);

app.use(errorHandler);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
