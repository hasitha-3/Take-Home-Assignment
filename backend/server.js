import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import Registration_api from "./routes/Registration.js";
import profile_api from "./routes/profile.js";
import login_api from "./routes/login.js";
import add_item from "./routes/add_item.js";
import find_items from "./routes/find_items.js";
import add_to_cart from "./routes/add_to_cart.js";
import orders_api from "./routes/orders.js";
import items_api from "./routes/items.js";
import notifications_api from "./routes/notifications.js";
import reviews_api from "./routes/reviews.js";
import wishlist_api from "./routes/wishlist.js";
import admin_api from "./routes/admin.js";

dotenv.config();

const mongoURI = process.env.MONGODB_URI;
const PORT = Number(process.env.PORT) || 8000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  FRONTEND_URL,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.startsWith("http://localhost:")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// ─── DB ──────────────────────────────────────────────────────────────────────
mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ─── ROUTES ──────────────────────────────────────────────────────────────────
app.use("/api/auth/register", Registration_api);
app.use("/api/auth/login", login_api);
app.use("/api/profile", profile_api);
app.use("/api/items", find_items);
app.use("/api/items", items_api);
app.use("/api/sell", add_item);
app.use("/api/cart", add_to_cart);
app.use("/api/orders", orders_api);
app.use("/api/notifications", notifications_api);
app.use("/api/reviews", reviews_api);
app.use("/api/wishlist", wishlist_api);
app.use("/api/admin", admin_api);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ─── START ───────────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use.`);
  } else {
    console.error("Server error:", error);
  }
});
