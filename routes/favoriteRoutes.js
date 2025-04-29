import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getFavoritelist,
  toggleFavorite,
} from "../controllers/FavoriteController.js";

const favoriteRouter = express.Router();

favoriteRouter.get("/", protect, getFavoritelist);
favoriteRouter.post("/toggle", protect, toggleFavorite);

export default favoriteRouter;
