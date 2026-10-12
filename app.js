import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import availabilityRoutes from "./routes/availabilityRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/availability", availabilityRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Hotel Reservation API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});