import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  Tag,
  Store,
  Package,
  Heart,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Navbar from "../Home/Navbar";
import api from "../../api";
import { useAppContext } from "../../MyContext";
import { getImageUrl } from "../../utils/categoryImages";

const CONDITION_COLORS = {
  "Brand New": "badge-success",
  "Like New": "badge-brand",
  Good: "badge-gray",
  Fair: "badge-warning",
  Poor: "badge-danger",
};

export default function MyListings() {
  const { info } = useAppContext();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await api.get(`/items?sellerId=${info.userId}`);
      setItems(res.data.items || []);
    } catch {
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this listing?"))
      return;
    setDeleting(id);
    try {
      await api.delete(`/items/${id}`);
      setItems((prev) => prev.filter((i) => i._id !== id));
      toast.success("Listing removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove listing");
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleAvailability = async (id) => {
    try {
      const res = await api.patch(`/items/${id}/availability`);
      setItems((prev) =>
        prev.map((i) =>
          i._id === id ? { ...i, isAvailable: res.data.isAvailable } : i,
        ),
      );
      toast.success(res.data.message);
    } catch {
      toast.error("Failed to update availability");
    }
  };

  const totalValue = items.reduce((sum, i) => sum + i.itemprice, 0);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="page-container py-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="page-container py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="hero-title text-3xl text-[var(--text-primary)]">
              My Listings
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              {items.length} items · Total value ₹
              {totalValue.toLocaleString("en-IN")}
            </p>
          </div>
          <Link to="/seller" className="btn btn-primary gap-1">
            <Plus size={16} /> Add New Listing
          </Link>
        </div>

        {/* Stats row */}
        {items.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              {
                label: "Active",
                val: items.filter((i) => i.isAvailable).length,
                color: "var(--success)",
              },
              {
                label: "Paused",
                val: items.filter((i) => !i.isAvailable).length,
                color: "var(--warning)",
              },
              {
                label: "Total Views",
                val: items.reduce((s, i) => s + i.views, 0),
                color: "var(--brand)",
              },
            ].map(({ label, val, color }) => (
              <div key={label} className="glass-card p-4 text-center">
                <p className="hero-title text-2xl" style={{ color }}>
                  {val}
                </p>
                <p className="text-xs text-[var(--text-muted)]">{label}</p>
              </div>
            ))}
          </div>
        )}

        {items.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">
              <Store size={64} className="text-[var(--text-muted)] mx-auto" />
            </span>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              No listings yet
            </h3>
            <p className="text-[var(--text-secondary)]">Start selling today!</p>
            <Link to="/seller" className="btn btn-primary mt-2">
              <Tag size={16} /> List Your First Item
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item._id}
                className="glass-card p-4 flex gap-4 items-start animate-fadeIn"
              >
                {/* Image */}
                <Link to={`/items/${item._id}`} className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-[var(--surface-2)]">
                    <img
                      src={getImageUrl(item.images, item.itemcategory)}
                      alt={item.itemname}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <Link
                        to={`/items/${item._id}`}
                        className="font-bold text-[var(--text-primary)] hover:text-[var(--brand)] capitalize line-clamp-1 transition-colors"
                      >
                        {item.itemname}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="badge badge-gray text-xs">
                          {item.itemcategory}
                        </span>
                        <span
                          className={`badge ${CONDITION_COLORS[item.condition] || "badge-gray"} text-xs`}
                        >
                          {item.condition}
                        </span>
                        {!item.isAvailable && (
                          <span className="badge badge-warning text-xs">
                            Paused
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="hero-title text-xl text-[var(--brand)] flex-shrink-0">
                      ₹{item.itemprice.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                    {item.itemdescription}
                  </p>

                  <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <Eye size={12} /> {item.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart size={12} /> {item.wishlistCount} wishlisted
                    </span>
                    <span className="flex items-center gap-1">
                      <Package size={12} /> Stock: {item.stock}
                    </span>
                    <span>
                      {new Date(item.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <button
                      onClick={() => handleToggleAvailability(item._id)}
                      className={`btn btn-sm gap-1 ${item.isAvailable ? "btn-secondary" : "btn-primary"}`}
                    >
                      {item.isAvailable ? (
                        <>
                          <EyeOff size={13} /> Pause
                        </>
                      ) : (
                        <>
                          <Eye size={13} /> Activate
                        </>
                      )}
                    </button>

                    <Link
                      to={`/items/${item._id}`}
                      className="btn btn-secondary btn-sm gap-1"
                    >
                      <Eye size={13} /> View
                    </Link>

                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={deleting === item._id}
                      className="btn btn-danger btn-sm gap-1"
                    >
                      {deleting === item._id ? (
                        <span className="w-3 h-3 border border-red-400 border-t-red-600 rounded-full animate-spin" />
                      ) : (
                        <>
                          <Trash2 size={13} /> Remove
                        </>
                      )}
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
