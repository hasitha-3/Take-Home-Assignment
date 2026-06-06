import express from "express";
import Orders from "../database/Orders.js";
import cart_items from "../database/cart_items.js";
import Items from "../database/Itemsdata.js";
import Notification from "../database/Notification.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Delivery partners pool
const DELIVERY_PARTNERS = [
  { name: "Arjun Sharma", phone: "9876543210", partnerId: "DP001" },
  { name: "Priya Patel", phone: "9876543211", partnerId: "DP002" },
  { name: "Rahul Verma", phone: "9876543212", partnerId: "DP003" },
  { name: "Sneha Reddy", phone: "9876543213", partnerId: "DP004" },
  { name: "Vikram Singh", phone: "9876543214", partnerId: "DP005" },
];

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();
const assignDeliveryPartner = () =>
  DELIVERY_PARTNERS[Math.floor(Math.random() * DELIVERY_PARTNERS.length)];

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
    const deliveryOTP = generateOTP();
    const deliveryPartner = assignDeliveryPartner();

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
      deliveryStatus: "Processing",
      deliveryOTP,
      deliveryPartner,
      shippingAddress: shippingAddress || "",
    });

    await newOrder.save();

    // Remove cart items
    await cart_items.deleteMany(query);

    // Create notification for buyer
    await Notification.create({
      user_id: buyer_id,
      type: "order_placed",
      title: "Order Placed Successfully! 🎉",
      message: `Your order ${orderNumber} has been placed. OTP for delivery: ${deliveryOTP}`,
      link: "/orders",
      data: { orderId: newOrder._id, orderNumber, deliveryOTP },
    });

    // Notify each unique seller
    const sellerIds = [...new Set(cartItems.map((i) => i.seller_id))];
    for (const sellerId of sellerIds) {
      const sellerItems = cartItems.filter((i) => i.seller_id === sellerId);
      await Notification.create({
        user_id: sellerId,
        type: "item_sold",
        title: "Item Sold! 🛍️",
        message: `${sellerItems.map((i) => i.itemname).join(", ")} sold via order ${orderNumber}`,
        link: "/my-listings",
        data: { orderId: newOrder._id, orderNumber },
      });
    }

    res.status(201).json({
      message: "Order placed successfully",
      order: newOrder,
      deliveryOTP,
      deliveryPartner: {
        name: deliveryPartner.name,
        phone: deliveryPartner.phone,
      },
    });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── GET user's orders ─────────────────────────────────────────────────────
router.get("/my", authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { buyer_id: req.user.userId };
    if (status) query.deliveryStatus = status;

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

// ─── POST cancel order ────────────────────────────────────────────────────────
router.post("/:orderId/cancel", authenticateToken, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Orders.findById(req.params.orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.buyer_id.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (["Delivered", "Cancelled"].includes(order.deliveryStatus)) {
      return res
        .status(400)
        .json({ message: `Cannot cancel a ${order.deliveryStatus} order` });
    }

    // Allow cancel within 24 hours of placing
    const hoursSincePlaced =
      (Date.now() - new Date(order.createdAt).getTime()) / 3600000;
    if (hoursSincePlaced > 24 && order.deliveryStatus !== "Processing") {
      return res
        .status(400)
        .json({
          message: "Orders can only be cancelled within 24 hours of placing",
        });
    }

    order.deliveryStatus = "Cancelled";
    order.paymentStatus = "Refunded";
    order.cancelledAt = new Date();
    order.cancelledBy = "buyer";
    order.cancellationReason = reason || "Cancelled by buyer";
    await order.save();

    // Create notification
    await Notification.create({
      user_id: req.user.userId,
      type: "order_cancelled",
      title: "Order Cancelled",
      message: `Order ${order.orderNumber} has been cancelled. Refund will be processed.`,
      link: "/orders",
      data: { orderId: order._id },
    });

    res.status(200).json({ message: "Order cancelled", order });
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── POST verify delivery OTP ─────────────────────────────────────────────────
router.post("/:orderId/verify-otp", authenticateToken, async (req, res) => {
  try {
    const { otp } = req.body;
    const order = await Orders.findById(req.params.orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.deliveryOTP !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    order.deliveryStatus = "Delivered";
    order.otpVerified = true;
    order.deliveredAt = new Date();
    order.paymentStatus = "Completed";
    await order.save();

    // Notify buyer
    await Notification.create({
      user_id: order.buyer_id,
      type: "order_delivered",
      title: "Order Delivered! ✅",
      message: `Order ${order.orderNumber} has been delivered successfully.`,
      link: "/orders",
    });

    res.status(200).json({ message: "Delivery confirmed", order });
  } catch (err) {
    console.error("OTP verify error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── PUT update delivery status (admin) ──────────────────────────────────────
router.put("/:orderId/status", authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin)
      return res.status(403).json({ message: "Admin only" });

    const { deliveryStatus, paymentStatus } = req.body;
    const order = await Orders.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const timestamps = {};
    if (deliveryStatus === "Confirmed") timestamps.confirmedAt = new Date();
    if (deliveryStatus === "Shipped") timestamps.shippedAt = new Date();
    if (deliveryStatus === "Delivered") timestamps.deliveredAt = new Date();

    const updated = await Orders.findByIdAndUpdate(
      req.params.orderId,
      {
        ...(deliveryStatus && { deliveryStatus }),
        ...(paymentStatus && { paymentStatus }),
        ...timestamps,
      },
      { new: true },
    );

    // Notify buyer
    const typeMap = {
      Confirmed: "order_confirmed",
      Shipped: "order_shipped",
      Delivered: "order_delivered",
    };

    if (typeMap[deliveryStatus]) {
      await Notification.create({
        user_id: order.buyer_id,
        type: typeMap[deliveryStatus],
        title: `Order ${deliveryStatus}`,
        message: `Your order ${order.orderNumber} is now ${deliveryStatus.toLowerCase()}.`,
        link: "/orders",
      });
    }

    res.status(200).json({ message: "Order status updated", order: updated });
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
