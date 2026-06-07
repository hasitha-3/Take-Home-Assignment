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

export default function MyProducts() {
  const { info } = useAppContext();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get(`/items?sellerId=${info.userId}`);
      setItems(res.data.items || []);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this product?"))
      return;
    setDeleting(id);
    try {
      await api.delete(`/items/${id}`);
      setItems((prev) => prev.filter((i) => i._id !== id));
      toast.success("Product removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove product");
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
              My Products
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              {items.length} items · Total value ₹
              {totalValue.toLocaleString("en-IN")}
            </p>
          </div>
          <Link to="/seller" className="btn btn-primary gap-1">
            <Plus size={16} /> Add New Product
          </Link>
        </div>



        {items.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">
              <Store size={64} className="text-[var(--text-muted)] mx-auto" />
            </span>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              No products yet
            </h3>
            <p className="text-[var(--text-secondary)]">Start selling today!</p>
            <Link to="/seller" className="btn btn-primary mt-2">
              <Tag size={16} /> List Your First Item
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {items.map((item) => (
              <div
                key={item._id}
                className={`glass-card animate-fadeIn ${(!item.isAvailable || item.stock <= 0) ? 'opacity-60 grayscale' : ''}`}
                style={{ padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', position: 'relative' }}
              >
                {/* Image */}
                <Link to={`/items/${item._id}`} className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-xl overflow-hidden bg-[var(--surface-2)] shadow-md">
                    <img
                      src={getImageUrl(item.images, item.itemcategory)}
                      alt={item.itemname}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/items/${item._id}`}
                    className="font-bold text-2xl text-[var(--text-primary)] hover:text-[var(--brand)] capitalize line-clamp-1 transition-colors"
                  >
                    {item.itemname}
                  </Link>
                  
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="badge badge-gray text-sm">
                      {item.itemcategory}
                    </span>
                    <span
                      className={`badge ${CONDITION_COLORS[item.condition] || "badge-gray"} text-sm`}
                    >
                      {item.condition}
                    </span>
                    {!item.isAvailable ? (
                      <span className="badge badge-warning text-sm">
                        Paused
                      </span>
                    ) : item.stock <= 0 ? (
                      <span className="badge badge-danger text-sm">
                        Sold
                      </span>
                    ) : null}
                  </div>

                  <p className="text-sm text-[var(--text-muted)] mt-3 line-clamp-2 leading-relaxed">
                    {item.itemdescription}
                  </p>

                  <div className="flex items-center gap-4 mt-4 text-sm text-[var(--text-muted)]">
                    <span className="flex items-center gap-1.5">
                      <Eye size={16} /> {item.views} views
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Heart size={16} /> {item.wishlistCount} wishlisted
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Package size={16} /> Stock: {item.stock}
                    </span>
                    <span className="ml-2 border-l border-[var(--border)] pl-4">
                      {new Date(item.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Right side Actions & Price */}
                <div className="flex flex-col items-end gap-6 ml-auto flex-shrink-0 border-l border-[var(--border)] pl-8">
                  <p className="hero-title text-3xl text-[var(--brand)] flex-shrink-0">
                    ₹{item.itemprice.toLocaleString("en-IN")}
                  </p>
                  
                  <div className="flex gap-3 flex-wrap justify-end">
                    <button
                      onClick={() => handleToggleAvailability(item._id)}
                      className={`btn gap-2 ${item.isAvailable ? "btn-secondary" : "btn-primary"}`}
                    >
                      {item.isAvailable ? (
                        <>
                          <EyeOff size={16} /> Pause
                        </>
                      ) : (
                        <>
                          <Eye size={16} /> Activate
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={deleting === item._id}
                      className="btn btn-danger gap-2"
                    >
                      {deleting === item._id ? (
                        <span className="w-4 h-4 border border-red-400 border-t-red-600 rounded-full animate-spin" />
                      ) : (
                        <>
                          <Trash2 size={16} /> Remove
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
