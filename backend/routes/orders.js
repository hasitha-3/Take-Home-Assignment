import express from "express";
import Orders from "../database/Orders.js";
import cart_items from "../database/cart_items.js";
import Items from "../database/Itemsdata.js";
import Notification from "../database/Notification.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// ─── POST create order from cart ──────────────────────────────────────────────
router.post("/create", authenticateToken, async (req, res) => {
  try {
    const { cartItemIds, shippingAddress } = req.body;
    const buyer_id = req.user.userId;

    // Get cart items
    const query =
      cartItemIds && cartItemIds.length > 0
        ? { _id: { $in: cartItemIds }, buyer_id, status_item: 0 }
        : { buyer_id, status_item: 0 };

    const cartItems = await cart_items.find(query);

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Validate none are own items
    for (const item of cartItems) {
      if (item.seller_id === buyer_id) {
        return res.status(400).json({ message: "Cannot order your own items" });
      }
    }

    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.itemprice * item.quantity,
      0,
    );

    const orderNumber = `BSL-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const newOrder = new Orders({
      buyer_id,
      orderNumber,
      items: cartItems.map((item) => ({
        item_id: item.item_id,
        itemname: item.itemname,
        itemprice: item.itemprice,
        quantity: item.quantity,
        seller_id: item.seller_id,
        itemcategory: item.itemcategory,
        imageUrl: item.imageUrl,
      })),
      totalPrice,
      paymentStatus: "Completed",
      deliveryStatus: "Completed",
      shippingAddress: shippingAddress || "",
    });

    await newOrder.save();

    // Decrease stock for ordered items
    for (const item of cartItems) {
      await Items.findByIdAndUpdate(
        item.item_id,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Remove cart items
    await cart_items.deleteMany(query);

    // Create notification for buyer
    try {
      await Notification.create({
        user_id: buyer_id,
        type: "order_placed",
        title: "Order Placed Successfully!",
        message: `Your order ${orderNumber} has been placed and completed.`,
        link: "/orders",
        data: { orderId: newOrder._id, orderNumber },
      });

      // Notify each unique seller
      const sellerIds = [...new Set(cartItems.map((i) => i.seller_id))];
      for (const sellerId of sellerIds) {
        if (!sellerId) continue;
        const sellerItems = cartItems.filter((i) => i.seller_id === sellerId);
        await Notification.create({
          user_id: sellerId,
          type: "item_sold",
          title: "Item Sold!",
          message: `${sellerItems.map((i) => i.itemname).join(", ")} sold via order ${orderNumber}`,
          link: "/my-products",
          data: { orderId: newOrder._id, orderNumber },
        });
      }
    } catch (notifErr) {
      console.error("Failed to create notifications:", notifErr);
    }

    res.status(201).json({
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── GET user's orders ─────────────────────────────────────────────────────
router.get("/my", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = { buyer_id: req.user.userId };

    const total = await Orders.countDocuments(query);
    const orders = await Orders.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      orders,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Fetch orders error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── GET single order ─────────────────────────────────────────────────────────
router.get("/:orderId", authenticateToken, async (req, res) => {
  try {
    const order = await Orders.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Only buyer or admin can view
    if (order.buyer_id.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
