import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    // Core info
    itemname: { type: String, required: true, trim: true },
    itemprice: { type: Number, required: true, min: 0 },
    itemcategory: { type: String, required: true, trim: true },
    itemdescription: { type: String, required: true, trim: true },
    seller_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Product details (like Amazon/Flipkart)
    brand: { type: String, default: "", trim: true },
    condition: {
      type: String,
      enum: ["Brand New", "Like New", "Good", "Fair", "Poor"],
      default: "Good",
    },
    usageDuration: { type: String, default: "" }, // e.g., "6 months", "2 years"
    tags: [{ type: String, trim: true }],
    location: { type: String, default: "", trim: true },

    // Media
    images: [{ url: String, publicId: String }],

    // Inventory
    stock: { type: Number, default: 1, min: 0 },
    isAvailable: { type: Boolean, default: true },

    // Stats
    views: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 },

    // Specs (key-value pairs for custom attributes)
    specifications: [
      {
        key: { type: String, trim: true },
        value: { type: String, trim: true },
      },
    ],

    // Timestamps + soft delete
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Text search index
itemSchema.index({
  itemname: "text",
  itemdescription: "text",
  brand: "text",
  tags: "text",
});

// Price index for sorting
itemSchema.index({ itemprice: 1 });
itemSchema.index({ itemcategory: 1 });
itemSchema.index({ seller_id: 1 });

const Items = mongoose.model("items_data", itemSchema);
export default Items;
