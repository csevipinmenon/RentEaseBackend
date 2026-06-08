import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
import authRoutes from "./routers/authRoutes.js";
import productRoutes from "./routers/productRoutes.js";
import rentalRoutes from "./routers/RentalRoutes.js";
import cartRoutes from "./routers/cartRoutes.js";
import maintenanceRoutes from "./routers/maintenanceRoutes.js";
import adminRoutes from "./routers/adminRoutes.js";
import Product from "./models/Product.js";

const migrateLegacyProductStock = async () => {
  await Product.collection.updateMany(
    {
      availableQty: { $exists: false },
      availableQuantity: { $exists: true },
    },
    [
      {
        $set: {
          availableQty: "$availableQuantity",
          totalQty: { $ifNull: ["$totalQty", "$availableQuantity"] },
        },
      },
    ],
  );
};

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "RentEase API is running" });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    await migrateLegacyProductStock();
    console.log("MongoDB connected successfully");
    app.listen(process.env.PORT || 5000, () => {
      console.log(` Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

export default app;
