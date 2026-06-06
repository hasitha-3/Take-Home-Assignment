import express from "express";
import Items from "../database/Itemsdata.js";
import { authenticateToken } from "../middleware/auth.js";
import { upload, uploadToCloudinary } from "../middleware/upload.js";
import Notification from "../database/Notification.js";

const router = express.Router();

// ─── POST add item (with optional image upload) ──────────────────────────────
router.post(
  "/",
  authenticateToken,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const {
        itemname,
        itemprice,
        itemcategory,
        itemdescription,
        brand,
        condition,
        usageDuration,
        location,
        stock,
        tags,
        specifications,
      } = req.body;

      if (!itemname || !itemprice || !itemcategory || !itemdescription) {
        return res
          .status(400)
          .json({
            message: "Name, price, category, and description are required",
          });
      }

      const price = parseFloat(itemprice);
      if (isNaN(price) || price < 0) {
        return res.status(400).json({ message: "Invalid price" });
      }

      // Upload images to Cloudinary
      let images = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const result = await uploadToCloudinary(file.buffer, "buysell/items");
          images.push({ url: result.secure_url, publicId: result.public_id });
        }
      }

      // Parse tags and specifications from JSON string (sent from form-data)
      let parsedTags = [];
      let parsedSpecs = [];
      try {
        parsedTags = tags ? JSON.parse(tags) : [];
        parsedSpecs = specifications ? JSON.parse(specifications) : [];
      } catch (_) {
        parsedTags = tags ? [tags] : [];
      }

      const newItem = new Items({
        itemname: itemname.trim(),
        itemprice: price,
        itemcategory,
        itemdescription: itemdescription.trim(),
        seller_id: req.user.userId,
        brand: brand || "",
        condition: condition || "Good",
        usageDuration: usageDuration || "",
        location: location || "",
        stock: parseInt(stock) || 1,
        tags: parsedTags,
        specifications: parsedSpecs,
        images,
      });

      await newItem.save();

      res
        .status(201)
        .json({ message: "Item listed successfully", item: newItem });
    } catch (err) {
      console.error("Add item error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },
);

export default router;
