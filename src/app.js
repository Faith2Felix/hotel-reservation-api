import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Connects to MongoDB using MONGO_URI from .env
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) =>
  res.send('Hotel Reservation API is active'),
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Teammates: mount your routers here, e.g.
// import roomRoutes from "./routes/roomRoutes.js";
// app.use("/api/rooms", roomRoutes);
// import bookingRoutes from "./routes/bookingRoutes.js";
// app.use("/api/bookings", bookingRoutes);

// Unknown routes
app.use((req, res) =>
  res
    .status(404)
    .json({
      success: false,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    }),
);

// Malformed JSON bodies (and any unexpected error)
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err.type === "entity.parse.failed") {
    return res
      .status(400)
      .json({ success: false, message: "Invalid JSON body." });
  }
  console.error(err);
  res.status(500).json({ success: false, message: "Server error" });
});

export default app;

// Start server only when run directly (keeps app importable for tests)
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
    console.error(
      "JWT_SECRET and MONGO_URI must be set. Copy .env.example to .env and fill it in.",
    );
    process.exit(1);
  }
  connectDB().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}
