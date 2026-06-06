import express from "express";
import Notification from "../database/Notification.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// ─── GET all notifications for user ──────────────────────────────────────────
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const query = { user_id: req.user.userId };

    const total = await Notification.countDocuments(query);
    const unread = await Notification.countDocuments({
      ...query,
      isRead: false,
    });
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({ notifications, total, unread });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── PUT mark all as read ─────────────────────────────────────────────────────
router.put("/read-all", authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { user_id: req.user.userId },
      { isRead: true },
    );
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ─── PUT mark single as read ──────────────────────────────────────────────────
router.put("/:notifId/read", authenticateToken, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.notifId, { isRead: true });
    res.status(200).json({ message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ─── DELETE single notification ───────────────────────────────────────────────
router.delete("/:notifId", authenticateToken, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.notifId);
    res.status(200).json({ message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
