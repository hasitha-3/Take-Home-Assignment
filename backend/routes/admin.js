import express from "express";
import User from "../database/userdata.js";
import Items from "../database/Itemsdata.js";
import Orders from "../database/Orders.js";
import Notification from "../database/Notification.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Middleware to verify admin
const isAdmin = (req, res, next) => {
  if (!req.user?.isAdmin)
    return res.status(403).json({ message: "Admin access required" });
  next();
};

// ─── GET dashboard stats ──────────────────────────────────────────────────────
router.get("/stats", authenticateToken, isAdmin, async (req, res) => {
  try {
    const [users, items, orders, revenue] = await Promise.all([
      User.countDocuments(),
      Items.countDocuments({ isDeleted: false }),
      Orders.countDocuments(),
      Orders.aggregate([
        { $match: { paymentStatus: "Completed" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
    ]);

    const recentOrders = await Orders.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("buyer_id", "firstname lastname Email");

    const topSellers = await Items.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$seller_id", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "seller",
        },
      },
      { $unwind: "$seller" },
    ]);

    // Orders by day for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const ordersByDay = await Orders.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      stats: {
        totalUsers: users,
        totalItems: items,
        totalOrders: orders,
        totalRevenue: revenue[0]?.total || 0,
      },
      recentOrders,
      topSellers,
      ordersByDay,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── GET all users ────────────────────────────────────────────────────────────
router.get("/users", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { firstname: { $regex: search, $options: "i" } },
        { lastname: { $regex: search, $options: "i" } },
        { Email: { $regex: search, $options: "i" } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({ users, total });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ─── PUT toggle user active status ───────────────────────────────────────────
router.put(
  "/users/:userId/toggle",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      user.isActive = !user.isActive;
      await user.save();

      res
        .status(200)
        .json({
          message: `User ${user.isActive ? "activated" : "deactivated"}`,
          user,
        });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ─── GET all items (admin view) ───────────────────────────────────────────────
router.get("/items", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await Items.countDocuments();
    const items = await Items.find()
      .populate("seller_id", "firstname lastname Email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({ items, total });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ─── DELETE remove any product ────────────────────────────────────────────────
router.delete(
  "/items/:itemId",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      await Items.findByIdAndUpdate(req.params.itemId, {
        isDeleted: true,
        isAvailable: false,
      });
      res.status(200).json({ message: "Item removed" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ─── GET all orders ───────────────────────────────────────────────────────────
router.get("/orders", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { deliveryStatus: status } : {};

    const total = await Orders.countDocuments(query);
    const orders = await Orders.find(query)
      .populate("buyer_id", "firstname lastname Email contact_number")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({ orders, total });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
