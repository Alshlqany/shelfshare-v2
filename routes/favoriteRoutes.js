import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  addToFavoritelist,
  getFavoritelist,
  removeFromFavoritelist,
} from "../controllers/FavoriteController.js";

const favoriteRouter = express.Router();

favoriteRouter.get("/", protect, getFavoritelist);
favoriteRouter.post("/", protect, addToFavoritelist);
favoriteRouter.delete("/:bookId", protect, removeFromFavoritelist);

export default favoriteRouter;
