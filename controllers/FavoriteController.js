import Favorite from "../models/Favorite.js";
import Book from "../models/Book.js";

export const toggleFavorite = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const existingFavorite = await Favorite.findOne({
      user: userId,
      book: bookId,
    });

    if (existingFavorite) {
      await Favorite.findByIdAndDelete(existingFavorite._id);
      await Book.findByIdAndUpdate(bookId, { $inc: { favorites: -1 } });
      return res
        .status(200)
        .json({ message: "Removed from favorites", favorited: false });
    } else {
      const favorite = await Favorite.create({ user: userId, book: bookId });
      await Book.findByIdAndUpdate(bookId, { $inc: { favorites: 1 } });
      return res
        .status(201)
        .json({ message: "Added to favorites", favorited: true, favorite });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getFavoritelist = async (req, res) => {
  try {
    const userId = req.user.id;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const totalBooks = await Favorite.countDocuments({ user: userId });

    const favoritees = await Favorite.find({ user: userId })
      .populate("book")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const favoriteList = favoritees
      .map((fav) => {
        if (!fav.book) return null;
        return {
          ...fav.book._doc,
          isFavorited: true,
        };
      })
      .filter(Boolean);

    res.json({
      count: favoriteList.length,
      totalBooks,
      currentPage: page,
      totalPages: Math.ceil(totalBooks / limit),
      favoriteList,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
