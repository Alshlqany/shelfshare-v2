import express from "express";
import {
  createStripeSession,
  getAllOrders,
  getOrderById,
} from "../controllers/orderController.js";
import { protect } from "../middlewares/authMiddleware.js";

const orderRoutes = express.Router();

orderRoutes.post("/checkout", protect, createStripeSession);
orderRoutes.get("/", protect, getAllOrders);
orderRoutes.get("/:orderId", protect, getOrderById);
export default orderRoutes;
