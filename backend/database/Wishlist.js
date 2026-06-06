import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "items_data",
      required: true,
    },
  },
  { timestamps: true },
);

// Unique combo — no duplicates
wishlistSchema.index({ user_id: 1, item_id: 1 }, { unique: true });

const Wishlist = mongoose.model("Wishlist", wishlistSchema);
export default Wishlist;
