import express from "express";
import Items from "../database/Itemsdata.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  upload,
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../middleware/upload.js";

const router = express.Router();

// ─── PUT edit own listing ─────────────────────────────────────────────────────
router.put(
  "/:itemId",
  authenticateToken,
  upload.array("newImages", 5),
  async (req, res) => {
    try {
      const item = await Items.findById(req.params.itemId);

      if (!item || item.isDeleted) {
        return res.status(404).json({ message: "Item not found" });
      }

      if (item.seller_id.toString() !== req.user.userId) {
        return res
          .status(403)
          .json({ message: "You can only edit your own listings" });
      }

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
        removeImageIds,
      } = req.body;

      // Build updates
      if (itemname) item.itemname = itemname.trim();
      if (itemprice) item.itemprice = parseFloat(itemprice);
      if (itemcategory) item.itemcategory = itemcategory;
      if (itemdescription) item.itemdescription = itemdescription.trim();
      if (brand !== undefined) item.brand = brand;
      if (condition) item.condition = condition;
      if (usageDuration !== undefined) item.usageDuration = usageDuration;
      if (location) item.location = location;
      if (stock !== undefined) item.stock = parseInt(stock);
      if (tags) item.tags = JSON.parse(tags);
      if (specifications) item.specifications = JSON.parse(specifications);

      // Remove specific images
      if (removeImageIds) {
        const ids = JSON.parse(removeImageIds);
        for (const pid of ids) {
          await deleteFromCloudinary(pid);
        }
        item.images = item.images.filter((img) => !ids.includes(img.publicId));
      }

      // Upload new images
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const result = await uploadToCloudinary(file.buffer, "buysell/items");
          item.images.push({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      }

      await item.save();
      res.status(200).json({ message: "Listing updated", item });
    } catch (err) {
      console.error("Edit item error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },
);

// ─── DELETE own listing (soft delete) ────────────────────────────────────────
router.delete("/:itemId", authenticateToken, async (req, res) => {
  try {
    const item = await Items.findById(req.params.itemId);

    if (!item || item.isDeleted) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.seller_id.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own listings" });
    }

    item.isDeleted = true;
    item.isAvailable = false;
    await item.save();

    res.status(200).json({ message: "Listing removed successfully" });
  } catch (err) {
    console.error("Delete item error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── PATCH toggle availability ────────────────────────────────────────────────
router.patch("/:itemId/availability", authenticateToken, async (req, res) => {
  try {
    const item = await Items.findById(req.params.itemId);

    if (!item || item.isDeleted) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.seller_id.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    res.status(200).json({
      message: `Item marked as ${item.isAvailable ? "available" : "unavailable"}`,
      isAvailable: item.isAvailable,
    });
  } catch (err) {
    console.error("Toggle availability error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
