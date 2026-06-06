import express from "express";
import Review from "../database/Review.js";
import Orders from "../database/Orders.js";
import Items from "../database/Itemsdata.js";
import User from "../database/userdata.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// ─── POST create review ────────────────────────────────────────────────────────
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      item_id,
      order_id,
      rating,
      title,
      comment,
      sellerRating,
      sellerComment,
    } = req.body;

    if (!item_id || !order_id || !rating) {
      return res
        .status(400)
        .json({ message: "item_id, order_id, and rating are required" });
    }

    // Verify buyer actually purchased this item
    const order = await Orders.findById(order_id);
    if (!order || order.buyer_id.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "You can only review items you purchased" });
    }

    const orderedItem = order.items.find(
      (i) => i.item_id?.toString() === item_id,
    );
    if (!orderedItem) {
      return res.status(400).json({ message: "Item not found in this order" });
    }

    const review = new Review({
      item_id,
      buyer_id: req.user.userId,
      seller_id: orderedItem.seller_id,
      order_id,
      rating,
      title: title || "",
      comment: comment || "",
      sellerRating,
      sellerComment: sellerComment || "",
    });

    await review.save();

    // Update seller rating
    if (sellerRating) {
      const seller = await User.findById(orderedItem.seller_id);
      if (seller) {
        seller.sellerRating =
          (seller.sellerRating * seller.totalRatings + sellerRating) /
          (seller.totalRatings + 1);
        seller.totalRatings += 1;
        await seller.save();
      }
    }

    res.status(201).json({ message: "Review submitted", review });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "You already reviewed this item for this order" });
    }
    console.error("Review error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── GET reviews for an item ──────────────────────────────────────────────────
router.get("/item/:itemId", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const total = await Review.countDocuments({ item_id: req.params.itemId });
    const reviews = await Review.find({ item_id: req.params.itemId })
      .populate("buyer_id", "firstname lastname avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res
      .status(200)
      .json({ reviews, total, avgRating: Math.round(avgRating * 10) / 10 });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
