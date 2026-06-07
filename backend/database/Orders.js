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
      default: "Completed",
    },
    deliveryStatus: {
      type: String,
      default: "Completed",
    },

    // Shipping address snapshot
    shippingAddress: { type: String, default: "" },
  },
  { timestamps: true },
);

orderSchema.index({ buyer_id: 1, createdAt: -1 });

const Orders = mongoose.model("orders", orderSchema);
export default Orders;
