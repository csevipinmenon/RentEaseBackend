import express from "express";
const router = express.Router();
import {
  createRental,
  getUserRentals,
  getRental,
  requestReturn,
  getAllRentals,
  updateRentalStatus,
} from "../controllers/rentalController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

router.use(protect);
router.post("/", createRental);
router.get("/my", getUserRentals);
router.get("/:id", getRental);
router.put("/:id/return", requestReturn);

// Admin routes
router.get("/", adminOnly, getAllRentals);
router.put("/:id/status", adminOnly, updateRentalStatus);

export default router;
