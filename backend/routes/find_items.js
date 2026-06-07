import express from "express";
import Items from "../database/Itemsdata.js";
import { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// ─── GET all items (with filters, search, sort, pagination) ─────────────────
// Query params: category, search, minPrice, maxPrice, sort, page, limit, condition, brand, sellerId
router.get("/", optionalAuth, async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sort = "newest",
      page = 1,
      limit = 20,
      condition,
      brand,
      sellerId,
    } = req.query;
    const query = { isDeleted: false };

    // Category filter
    if (category && category !== "All") {
      query.itemcategory = category;
    }

    // Text search
    if (search && search.trim()) {
      query.$or = [
        { itemname: { $regex: search.trim(), $options: "i" } },
        { itemdescription: { $regex: search.trim(), $options: "i" } },
        { brand: { $regex: search.trim(), $options: "i" } },
        { tags: { $in: [new RegExp(search.trim(), "i")] } },
      ];
    }

    // Price range
    if (minPrice || maxPrice) {
      query.itemprice = {};
      if (minPrice) query.itemprice.$gte = Number(minPrice);
      if (maxPrice) query.itemprice.$lte = Number(maxPrice);
    }

    // Condition filter
    if (condition) query.condition = condition;

    // Brand filter
    if (brand) query.brand = { $regex: brand, $options: "i" };

    // Seller filter (for My Products)
    if (sellerId) {
      query.seller_id = sellerId;
      delete query.isAvailable; // show seller's items regardless
      delete query.isDeleted;
      query.isDeleted = false;
    }

    // Sort
    let sortObj = {};
    switch (sort) {
      case "price_asc":
        sortObj = { itemprice: 1 };
        break;
      case "price_desc":
        sortObj = { itemprice: -1 };
        break;
      case "oldest":
        sortObj = { createdAt: 1 };
        break;
      case "popular":
        sortObj = { views: -1 };
        break;
      default:
        sortObj = { createdAt: -1 }; // newest
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Items.countDocuments(query);
    const items = await Items.find(query)
      .populate(
        "seller_id",
        "firstname lastname Email contact_number address avatar isOnline sellerRating",
      )
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      items,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (err) {
    console.error("Fetch items error:", err);
    res
      .status(500)
      .json({ message: "Error fetching items", error: err.message });
  }
});

// ─── GET single item by ID ────────────────────────────────────────────────────
router.get("/:itemId", async (req, res) => {
  try {
    const item = await Items.findById(req.params.itemId).populate(
      "seller_id",
      "firstname lastname Email contact_number address avatar isOnline sellerRating lastSeen createdAt",
    );

    if (!item || item.isDeleted) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Increment view count
    item.views += 1;
    await item.save();

    res.status(200).json(item);
  } catch (err) {
    console.error("Fetch item error:", err);
    res
      .status(500)
      .json({ message: "Error fetching item", error: err.message });
  }
});

export default router;
