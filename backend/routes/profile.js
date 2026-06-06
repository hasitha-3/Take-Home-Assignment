import express from "express";
import bcrypt from "bcrypt";
import User from "../database/userdata.js";
import Items from "../database/Itemsdata.js";
import Orders from "../database/Orders.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  upload,
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../middleware/upload.js";

const router = express.Router();

// ─── GET profile by ID ───────────────────────────────────────────────────────
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Public profile: no password
    const stats = {
      itemsListed: await Items.countDocuments({
        seller_id: req.params.userId,
        isDeleted: false,
      }),
      ordersMade: await Orders.countDocuments({ buyer_id: req.params.userId }),
    };

    res.status(200).json({ ...user.toObject(), stats });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── PUT update profile ──────────────────────────────────────────────────────
router.put("/:userId", authenticateToken, async (req, res) => {
  try {
    // Users can only update their own profile
    if (req.user.userId !== req.params.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { firstname, lastname, contact_number, age, bio, address, city } =
      req.body;

    const updates = {};
    if (firstname) updates.firstname = firstname.trim();
    if (lastname) updates.lastname = lastname.trim();
    if (contact_number) updates.contact_number = contact_number.trim();
    if (age) updates.age = Number(age);
    if (bio !== undefined) updates.bio = bio.trim();
    if (address) updates.address = address.trim();
    if (city) updates.city = city.trim();

    const updated = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: updates },
      { new: true, runValidators: true },
    );

    res.status(200).json({ message: "Profile updated", user: updated });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── POST avatar upload ──────────────────────────────────────────────────────
router.post(
  "/:userId/avatar",
  authenticateToken,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (req.user.userId !== req.params.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (!req.file)
        return res.status(400).json({ message: "No image provided" });

      const user = await User.findById(req.params.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Delete old avatar
      if (user.avatarPublicId) {
        await deleteFromCloudinary(user.avatarPublicId);
      }

      // Upload new avatar
      const result = await uploadToCloudinary(
        req.file.buffer,
        "buysell/avatars",
      );
      user.avatar = result.secure_url;
      user.avatarPublicId = result.public_id;
      await user.save();

      res
        .status(200)
        .json({ message: "Avatar updated", avatar: result.secure_url });
    } catch (err) {
      console.error("Avatar upload error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },
);

// ─── PUT change password ─────────────────────────────────────────────────────
router.put("/:userId/password", authenticateToken, async (req, res) => {
  try {
    if (req.user.userId !== req.params.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both passwords are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.params.userId).select("+password");
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Password change error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
