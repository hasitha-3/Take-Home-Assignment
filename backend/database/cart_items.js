import mongoose from "mongoose";

const cart_item = new mongoose.Schema(
  {
    item_id: { type: mongoose.Schema.Types.ObjectId, ref: "items_data" },
    itemname: { type: String, required: true },
    itemprice: { type: Number, required: true },
    itemcategory: { type: String, required: true },
    itemdescription: { type: String, required: true },
    seller_id: { type: String, required: true },
    buyer_id: { type: String, required: true }, // ✅ Fixed: was buyyer_id
    quantity: { type: Number, required: true, default: 1, min: 1 },
    status_item: { type: Number, required: true, default: 0 }, // 0 = in cart, 1 = ordered
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true },
);

const cart_items = mongoose.model("cart_items", cart_item);
export default cart_items;
