import express from "express";
import {
  getMe,
  editProfile,
  getAllUsers,
  changeUserRole,
} from "../controllers/userControllers.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const userRoutes = express.Router();

userRoutes.get("/me", protect, getMe);
userRoutes.put("/", protect, editProfile);
userRoutes.get("/", protect, adminOnly, getAllUsers);
userRoutes.put("/role/:userId", protect, adminOnly, changeUserRole);

export default userRoutes;
