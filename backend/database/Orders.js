import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    buyer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderNumber: { type: String, required: true, unique: true },

    items: [
      {
        item_id: { type: mongoose.Schema.Types.ObjectId, ref: "items_data" },
        itemname: { type: String, required: true },
        itemprice: { type: Number, required: true },
        quantity: { type: Number, required: true },
        seller_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        itemcategory: { type: String, required: true },
        imageUrl: { type: String, default: "" },
      },
    ],

    totalPrice: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed", "Refunded"],
      default: "Pending",
    },
    deliveryStatus: {
      type: String,
      enum: [
        "Processing",
        "Confirmed",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
        "Returned",
      ],
      default: "Processing",
    },

    // Delivery OTP — 6-digit code shown to buyer, seller/partner uses to confirm delivery
    deliveryOTP: { type: String, default: "" },
    otpVerified: { type: Boolean, default: false },

    // Delivery partner info
    deliveryPartner: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      partnerId: { type: String, default: "" },
    },

    // Cancellation
    cancellationReason: { type: String, default: "" },
    cancelledAt: { type: Date },
    cancelledBy: {
      type: String,
      enum: ["buyer", "seller", "admin", ""],
      default: "",
    },

    // Shipping address snapshot
    shippingAddress: { type: String, default: "" },

    // Timestamps
    confirmedAt: { type: Date },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    returnedAt: { type: Date },
  },
  { timestamps: true },
);

orderSchema.index({ buyer_id: 1, createdAt: -1 });

const Orders = mongoose.model("orders", orderSchema);
export default Orders;
