import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "items_data",
      required: true,
    },
    buyer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "orders",
      required: true,
    },

    // Product review
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: "", trim: true },
    comment: { type: String, default: "", trim: true },
    images: [{ type: String }], // Cloudinary URLs

    // Seller review
    sellerRating: { type: Number, min: 1, max: 5 },
    sellerComment: { type: String, default: "", trim: true },

    isVerifiedPurchase: { type: Boolean, default: true },
    helpfulCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// One review per buyer per item per order
reviewSchema.index({ item_id: 1, buyer_id: 1, order_id: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
