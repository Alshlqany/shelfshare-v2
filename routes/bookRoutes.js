import express from "express";
import {
  getAllBooks,
  addBook,
  updateBook,
  deleteBook,
  addReview,
  getBookById,
  getAllSubCategories,
} from "../controllers/bookController.js";
import { adminOnly, protect, setUser } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

const bookRouter = express.Router();

bookRouter.get("/", setUser, getAllBooks);
bookRouter.get("/categories", getAllSubCategories);
bookRouter.get("/:bookId", setUser, getBookById);
bookRouter.post("/", protect, adminOnly, upload.single("image"), addBook);
bookRouter.patch(
  "/:id",
  protect,
  adminOnly,
  upload.single("image"),
  updateBook
);
bookRouter.delete("/:id", protect, adminOnly, deleteBook);
bookRouter.post("/review/:bookId", protect, addReview);

export default bookRouter;
