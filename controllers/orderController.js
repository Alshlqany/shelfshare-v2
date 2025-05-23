import Stripe from "stripe";
import Order from "../models/Order.js";
import Book from "../models/Book.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createStripeSession = async (req, res) => {
  try {
    const { books } = req.body; // [{ book: bookId, qty }]
    const userId = req.user.id;

    if (!books || !Array.isArray(books) || books.length === 0) {
      return res
        .status(400)
        .json({ message: "Order must contain at least one book." });
    }

    const line_items = [];
    let totalAmount = 0;
    const validBooks = [];

    for (const { book: bookId, qty } of books) {
      if (qty < 1) {
        return res
          .status(400)
          .json({ message: "Quantity must be at least 1." });
      }

      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      if (qty > book.qty) {
        return res
          .status(400)
          .json({ message: `Only ${book.qty} left for: ${book.title}` });
      }

      validBooks.push({ book: book.id, qty });
      totalAmount += book.price * qty;

      line_items.push({
        price_data: {
          currency: "egp",
          product_data: {
            name: book.title,
            images: [book.image],
          },
          unit_amount: Math.round(book.price * 100),
        },
        quantity: qty,
      });
    }

    const order = await Order.create({
      user: userId,
      books: validBooks,
      totalAmount,
      paymentStatus: "pending",
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: `${process.env.Frontend_URL}/success`,
      cancel_url: `${process.env.Frontend_URL}/cancel`,
      metadata: {
        orderId: order._id.toString(),
      },
    });

    order.stripeSessionId = session.id;
    await order.save();

    res.json({ url: session.url });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      userId,
      minTotal,
      maxTotal,
      admin,
    } = req.query;

    const skip = (page - 1) * limit;
    const query = {};

    const isAdmin = req.user.role === "admin" && admin === "true";

    if (!isAdmin) {
      query.user = req.user.id;
    }
    if (isAdmin && userId) {
      query.user = userId;
    }

    if (status) {
      query.paymentStatus = status;
    }

    if (minTotal || maxTotal) {
      query.totalAmount = {};
      if (minTotal) query.totalAmount.$gte = Number(minTotal);
      if (maxTotal) query.totalAmount.$lte = Number(maxTotal);
    }

    const orders = await Order.find(query)
      .populate("user", "name email address phone")
      .populate("books.book", "title price image reviews")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    if (!isAdmin) {
      const userIdStr = req.user.id.toString();
      for (const order of orders) {
        order.books = order.books.map((item) => {
          const book = item.book;
          const userReview = book?.reviews?.find(
            (rev) => rev.user?.toString() === userIdStr
          );

          return {
            ...item,
            book: {
              ...book,
              reviews: null,
              userRating: userReview?.rate || null,
            },
          };
        });
      }
    }

    const total = await Order.countDocuments(query);

    res.status(200).json({
      orders,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalOrders: total,
    });
  } catch (error) {
    console.error("Error in getAllOrders:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("user", "name email address")
      .populate("books.book", "title price image reviews");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (req.user.role !== "admin" && order.user.id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedBooks = order.books.map((item) => {
      const book = item.book;
      const userReview = book.reviews?.find(
        (r) => r.user.toString() === req.user.id
      );
      return {
        ...item.toObject(),
        book,
        userRating: userReview ? userReview.rate : null,
      };
    });

    res.status(200).json({
      ...order.toObject(),
      books: updatedBooks,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get order" });
  }
};
