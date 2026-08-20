import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  addOrder,
  deleteOrder,
  getOrder,
  getOrderByUser,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/add", authMiddleware, addOrder);
router.get("/", authMiddleware, getOrder);
router.get("/all", authMiddleware, getOrderByUser);
router.put("/:id/status", authMiddleware, updateOrderStatus);
router.put("/:id/cancel", authMiddleware, cancelOrder);
router.delete("/:id", authMiddleware, deleteOrder);

export default router;