import Book from "../models/Book.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

const getSalesStats = async (startDate, endDate) => {
  const salesAggregation = [
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
        totalRefunds: {
          $sum: { $cond: [{ $eq: ["$paymentStatus", "failed"] }, 1, 0] },
        },
        totalPayments: {
          $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0] },
        },
      },
    },
  ];

  return Order.aggregate(salesAggregation);
};

const getUserStats = async (startDate, endDate) => {
  const usersAggregation = [
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
      },
    },
  ];

  return User.aggregate(usersAggregation);
};

const getBookStats = async (startDate, endDate) => {
  const booksAggregation = [
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalBooks: { $sum: 1 },
        booksOutOfStock: {
          $sum: { $cond: [{ $eq: ["$qty", 0] }, 1, 0] },
        },
        booksWithLowStock: {
          $sum: { $cond: [{ $lt: ["$qty", 5] }, 1, 0] },
        },
      },
    },
  ];

  return Book.aggregate(booksAggregation);
};

export const getAdminStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();

    const [salesStats, userStats, bookStats] = await Promise.all([
      getSalesStats(start, end),
      getUserStats(start, end),
      getBookStats(start, end),
    ]);

    const response = {
      sales: salesStats[0] || {},
      users: userStats[0] || {},
      books: bookStats[0] || {},
    };

    res.json(response);
  } catch (error) {
    console.log("Error fetching stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};
