import express from "express";
const router = express.Router();
import {
  getDashboardStats,
  getUsers,
  toggleUser,
  getServiceAreas,
  createServiceArea,
  updateServiceArea,
  deleteServiceArea,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

router.use(protect, adminOnly);
router.get("/stats", getDashboardStats);
router.get("/users", getUsers);
router.put("/users/:id/toggle", toggleUser);
router.get("/service-areas", getServiceAreas);
router.post("/service-areas", createServiceArea);
router.put("/service-areas/:id", updateServiceArea);
router.delete("/service-areas/:id", deleteServiceArea);

export default router;
