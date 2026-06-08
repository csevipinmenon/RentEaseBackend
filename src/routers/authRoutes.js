import express from "express";
const router = express.Router();
import {
  register,
  login,
  getProfile,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

export default router;
