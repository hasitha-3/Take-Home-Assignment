import express from "express";
import cart_items from "../database/cart_items.js";
import Items from "../database/Itemsdata.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// ─── GET cart items for user ─────────────────────────────────────────────────
router.get("/", authenticateToken, async (req, res) => {
  try {
    const cartItems = await cart_items
      .find({
        buyer_id: req.user.userId,
        status_item: 0,
      })
      .sort({ createdAt: -1 });

    const total = cartItems.reduce(
      (sum, item) => sum + item.itemprice * item.quantity,
      0,
    );

    res.status(200).json({ items: cartItems, total });
  } catch (err) {
    console.error("Fetch cart error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── POST add to cart ────────────────────────────────────────────────────────
router.post("/add", authenticateToken, async (req, res) => {
  try {
    const { item_info, quantity = 1 } = req.body;

    if (!item_info) {
      return res.status(400).json({ message: "Item info is required" });
    }

    // Prevent buying own item
    if (
      item_info.seller_id &&
      item_info.seller_id.toString() === req.user.userId
    ) {
      return res.status(400).json({ message: "You cannot buy your own item" });
    }

    // Check item still available
    const dbItem = await Items.findById(item_info._id);
    if (!dbItem || dbItem.isDeleted || !dbItem.isAvailable) {
      return res.status(400).json({ message: "Item is no longer available" });
    }

    // Check stock
    const currentCartQty = await cart_items.aggregate([
      {
        $match: {
          buyer_id: req.user.userId,
          item_id: dbItem._id,
          status_item: 0,
        },
      },
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]);
    const cartQty = currentCartQty[0]?.total || 0;

    if (cartQty + quantity > dbItem.stock) {
      return res.status(400).json({
        message: `Only ${dbItem.stock - cartQty} left in stock`,
      });
    }

    // Check if already in cart
    const existing = await cart_items.findOne({
      buyer_id: req.user.userId,
      item_id: dbItem._id,
      status_item: 0,
    });

    if (existing) {
      existing.quantity += quantity;
      await existing.save();
      return res.status(200).json({ message: "Cart updated", item: existing });
    }

    const newCartItem = new cart_items({
      item_id: dbItem._id,
      itemname: dbItem.itemname,
      itemprice: dbItem.itemprice,
      itemcategory: dbItem.itemcategory,
      itemdescription: dbItem.itemdescription,
      seller_id: dbItem.seller_id.toString(),
      buyer_id: req.user.userId,
      quantity,
      imageUrl: dbItem.images?.[0]?.url || "",
    });

    await newCartItem.save();
    res.status(200).json({ message: "Added to cart", item: newCartItem });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── PUT update quantity ─────────────────────────────────────────────────────
router.put("/update/:cartItemId", authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;

    const cartItem = await cart_items.findById(req.params.cartItemId);
    if (!cartItem)
      return res.status(404).json({ message: "Cart item not found" });

    // Auth check
    if (cartItem.buyer_id !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check stock
    const dbItem = await Items.findById(cartItem.item_id);
    if (dbItem && quantity > dbItem.stock) {
      return res.status(400).json({ message: `Only ${dbItem.stock} left in stock` });
    }

    if (quantity <= 0) {
      await cart_items.findByIdAndDelete(req.params.cartItemId);
      return res.status(200).json({ message: "Item removed from cart" });
    }

    const updated = await cart_items.findByIdAndUpdate(
      req.params.cartItemId,
      { quantity },
      { new: true },
    );

    res.status(200).json({ message: "Quantity updated", item: updated });
  } catch (err) {
    console.error("Update cart error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── DELETE remove item ──────────────────────────────────────────────────────
router.delete("/remove/:cartItemId", authenticateToken, async (req, res) => {
  try {
    const cartItem = await cart_items.findById(req.params.cartItemId);
    if (!cartItem)
      return res.status(404).json({ message: "Cart item not found" });

    if (cartItem.buyer_id !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    await cart_items.findByIdAndDelete(req.params.cartItemId);
    res.status(200).json({ message: "Item removed from cart" });
  } catch (err) {
    console.error("Remove cart error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── DELETE clear all cart ───────────────────────────────────────────────────
router.delete("/clear", authenticateToken, async (req, res) => {
  try {
    await cart_items.deleteMany({ buyer_id: req.user.userId, status_item: 0 });
    res.status(200).json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
