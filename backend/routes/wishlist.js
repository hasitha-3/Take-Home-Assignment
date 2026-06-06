import express from "express";
import Wishlist from "../database/Wishlist.js";
import Items from "../database/Itemsdata.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// ─── GET user's wishlist ──────────────────────────────────────────────────────
router.get("/", authenticateToken, async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ user_id: req.user.userId })
      .populate({
        path: "item_id",
        populate: {
          path: "seller_id",
          select: "firstname lastname avatar isOnline",
        },
      })
      .sort({ createdAt: -1 });

    const items = wishlist
      .filter((w) => w.item_id && !w.item_id.isDeleted)
      .map((w) => w.item_id);

    res.status(200).json({ items, count: items.length });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── POST toggle wishlist ─────────────────────────────────────────────────────
router.post("/toggle/:itemId", authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;

    const existing = await Wishlist.findOne({
      user_id: req.user.userId,
      item_id: itemId,
    });

    if (existing) {
      await Wishlist.findByIdAndDelete(existing._id);
      // Decrement wishlist count on item
      await Items.findByIdAndUpdate(itemId, { $inc: { wishlistCount: -1 } });
      return res
        .status(200)
        .json({ message: "Removed from wishlist", wishlisted: false });
    }

    await Wishlist.create({ user_id: req.user.userId, item_id: itemId });
    await Items.findByIdAndUpdate(itemId, { $inc: { wishlistCount: 1 } });

    res.status(200).json({ message: "Added to wishlist", wishlisted: true });
  } catch (err) {
    console.error("Wishlist error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── GET check if item is wishlisted ─────────────────────────────────────────
router.get("/check/:itemId", authenticateToken, async (req, res) => {
  try {
    const exists = await Wishlist.findOne({
      user_id: req.user.userId,
      item_id: req.params.itemId,
    });
    res.status(200).json({ wishlisted: !!exists });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
