import express from "express";
const router = express.Router();
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from "../controllers/productController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/:id", getProduct);
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;
