import Book from "../models/Book.js";
import Order from "../models/Order.js";

export const getAllBooks = async (req, res) => {
  try {
    const { page = 1, limit = 12, sort, search, ISBN, ...filters } = req.query;

    let mongoQuery = {};
    if (search) {
      mongoQuery.$text = { $search: search };
    }
    if (ISBN) {
      mongoQuery.ISBN = ISBN;
    }
    for (const key in filters) {
      mongoQuery[key] = filters[key];
    }

    const skip = (page - 1) * limit;

    const totalBooks = await Book.countDocuments(mongoQuery);

    let query = Book.find(mongoQuery).select("-reviews");

    if (sort) {
      const sortBy = sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    query = query.skip(skip).limit(Number(limit));
    const books = await query;

    res.status(200).json({
      books,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
      currentPage: Number(page),
      hasNextPage: skip + books.length < totalBooks,
      hasPreviousPage: skip > 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getBookById = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user?.id;
    let book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const hasOrdered = await Order.findOne({
      user: userId,
      paymentStatus: "paid",
      "books.book": bookId,
    });

    const alreadyReviewed = book.reviews.find(
      (rev) => rev.user.toString() === userId.toString()
    );

    res.status(200).json({
      ...book._doc,
      canReview: Boolean(hasOrdered && !alreadyReviewed),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addBook = async (req, res) => {
  try {
    const {
      title,
      description,
      mainCategory,
      subCategory,
      price,
      ISBN,
      author,
      qty,
    } = req.body;

    const image = req.file?.path;

    const book = await Book.create({
      title,
      description,
      mainCategory,
      subCategory,
      price,
      ISBN,
      author,
      qty,
      image,
    });

    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ message: "Failed to add book", error: err.message });
  }
};

export const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const updates = req.body;
    if (req.file) {
      updates.image = req.file.path;
    }

    const updatedBook = await Book.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json(updatedBook);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update book", error: err.message });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Book not found" });
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const addReview = async (req, res) => {
  const { rate } = req.body;
  const userId = req.user.id;
  const { bookId } = req.params;

  if (!rate || rate < 1 || rate > 5) {
    return res.status(400).json({ message: "rate must be between 1 and 5" });
  }

  try {
    const hasOrdered = await Order.findOne({
      user: userId,
      paymentStatus: "paid",
      "books.book": bookId,
    });

    if (!hasOrdered) {
      return res
        .status(403)
        .json({ message: "You can only review books you've purchased." });
    }

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const alreadyReviewed = book.reviews.find(
      (rev) => rev.user.toString() === userId.toString()
    );
    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this book." });
    }

    book.reviews.push({ user: userId, rate });

    const totalRates = book.reviews.length;
    const sumrates = book.reviews.reduce((sum, r) => sum + r.rate, 0);
    book.rate = sumrates / totalRates;

    await book.save();

    res.status(201).json({ message: "Review added", rate: book.rate });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};
