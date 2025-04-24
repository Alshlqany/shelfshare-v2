import Favorite from "../models/Favorite.js";
import Book from "../models/Book.js";

export const addToFavoritelist = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const favorite = await Favorite.create({ user: userId, book: bookId });
    await Book.findByIdAndUpdate(bookId, { $inc: { favorites: 1 } });

    res.status(201).json({ message: "Book added to favoritelist", favorite });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "The Book is Already in favoritelist" });
    }
    res.status(500).json({ message: "internal Server error" });
  }
};

export const removeFromFavoritelist = async (req, res) => {
  try {
    const bookId = req.params.bookId;
    const userId = req.user.id;

    const favorite = await Favorite.findOneAndDelete({
      user: userId,
      book: bookId,
    });
    
    if (!favorite)
      return res
        .status(404)
        .json({ message: "Book not found in favoritelist" });

    await Book.findByIdAndUpdate(bookId, { $inc: { favorites: -1 } });

    res.json({ message: "Book removed from your favoritelist" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getFavoritelist = async (req, res) => {
  try {
    const userId = req.user.id;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Favorite.countDocuments({ user: userId });

    const favoritees = await Favorite.find({ user: userId })
      .populate("book")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      count: favoritees.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      favoriteList: favoritees.map((f) => f.book),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
