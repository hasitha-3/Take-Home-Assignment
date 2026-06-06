import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../database/userdata.js";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.SECRET_KEY || "buy_sell_rent_secret_key";

router.post("/", async (req, res) => {
  try {
    const { Email, password } = req.body;

    if (!Email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Explicitly select password (it's excluded by default)
    const user = await User.findOne({
      Email: { $regex: `^${Email}$`, $options: "i" },
    }).select("+password");

    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with this email." });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "Account is suspended. Contact support." });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    // Update online status
    user.lastSeen = new Date();
    user.isOnline = true;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.Email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({ token, userInfo: userObj });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Logout (update online status)
router.post("/logout", async (req, res) => {
  try {
    const { userId } = req.body;
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
      });
    }
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
