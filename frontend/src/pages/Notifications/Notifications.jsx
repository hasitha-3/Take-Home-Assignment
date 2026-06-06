import React, { useEffect, useState } from "react";
import {
  Bell,
  Check,
  Trash2,
  Package,
  Star,
  Tag,
  AlertCircle,
  ShoppingCart,
  BellOff,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import Navbar from "../Home/Navbar";
import api from "../../api";
import { useAppContext } from "../../MyContext";

const TYPE_ICONS = {
  order_placed: <Package className="text-blue-500" />,
  order_confirmed: <Check className="text-indigo-500" />,
  order_shipped: <Package className="text-cyan-500" />,
  order_delivered: <Check className="text-green-500" />,
  order_cancelled: <AlertCircle className="text-red-500" />,
  item_sold: <Tag className="text-emerald-500" />,
  item_added_to_cart: <ShoppingCart className="text-amber-500" />,
  review_received: <Star className="text-yellow-500" />,
  system: <Bell className="text-gray-500" />,
  otp_generated: <AlertCircle className="text-purple-500" />,
};

export default function Notifications() {
  const { refreshNotifCount } = useAppContext();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications || []);
      refreshNotifCount();
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
      refreshNotifCount();
    } catch {
      toast.error("Failed to update");
    }
  };

  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      refreshNotifCount();
      toast.success("All marked as read");
    } catch {
      toast.error("Failed to update");
    }
  };

  const deleteNotif = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      refreshNotifCount();
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="page-container py-6 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="page-container py-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="hero-title text-3xl text-[var(--text-primary)]">
            Notifications
          </h1>
          {notifications.some((n) => !n.isRead) && (
            <button onClick={markAllRead} className="btn btn-secondary btn-sm">
              <Check size={14} /> Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">
              <BellOff size={64} className="text-[var(--text-muted)] mx-auto" />
            </span>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              You're all caught up!
            </h3>
            <p className="text-[var(--text-secondary)]">
              No new notifications right now.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`glass-card p-4 flex gap-4 transition-all ${n.isRead ? "opacity-70" : "ring-1 ring-[var(--brand)] shadow-[var(--shadow-glow)]"}`}
              >
                <div className="w-10 h-10 rounded-full bg-[var(--surface-2)] flex items-center justify-center flex-shrink-0 mt-1">
                  {TYPE_ICONS[n.type] || <Bell size={18} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3
                      className={`text-sm font-semibold ${n.isRead ? "text-[var(--text-primary)]" : "text-[var(--brand)]"}`}
                    >
                      {n.title}
                    </h3>
                    <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="text-sm text-[var(--text-secondary)] mt-1 mb-2">
                    {n.message}
                  </p>

                  <div className="flex items-center gap-2">
                    {n.link && (
                      <Link
                        to={n.link}
                        className="btn btn-secondary btn-sm h-7 text-xs"
                      >
                        View Details
                      </Link>
                    )}
                    {!n.isRead && (
                      <button
                        onClick={() => markAsRead(n._id)}
                        className="btn btn-ghost btn-sm h-7 text-xs text-[var(--brand)]"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotif(n._id)}
                      className="btn btn-ghost btn-icon h-7 w-7 text-[var(--text-muted)] hover:text-red-500 ml-auto"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
