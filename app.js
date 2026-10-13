import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import reservationRoutes from "./src/routes/reservationRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/reservations", reservationRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Hotel Reservation API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});