import express from "express";
import { adminOnly, protect } from "../middlewares/authMiddleware.js";
import { getAdminStats } from "../controllers/statsController.js";

const statsRoutes = express.Router();

statsRoutes.get("/", protect,adminOnly, getAdminStats);

export default statsRoutes;
