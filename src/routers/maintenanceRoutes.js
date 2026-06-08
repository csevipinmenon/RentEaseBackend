import express from "express";
const router = express.Router();
import {
  createRequest,
  getUserRequests,
  getAllRequests,
  updateRequest,
} from "../controllers/maintenceController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

router.use(protect);
router.post("/", createRequest);
router.get("/my", getUserRequests);
router.get("/", adminOnly, getAllRequests);
router.put("/:id", adminOnly, updateRequest);

export default router;
