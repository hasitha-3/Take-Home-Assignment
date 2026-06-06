import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookHeart, ShoppingBag, Heart } from "lucide-react";
import { toast } from "react-hot-toast";
import Navbar from "../Home/Navbar";
import ItemLayout from "../Item/Item_layout";
import api from "../../api";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const res = await api.get("/wishlist");
      setItems(res.data.items || []);
    } catch {
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // Update when item is removed from wishlist component
  const handleWishlistChange = () => fetchWishlist();

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="page-container py-6">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="hero-title text-3xl text-[var(--text-primary)]">
            My Wishlist
          </h1>
          {!loading && (
            <span className="badge badge-brand">{items.length} items</span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="skeleton w-full rounded-2xl"
                style={{ height: 340 }}
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">
              <Heart size={64} className="text-red-500 mx-auto" />
            </span>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              Your wishlist is empty
            </h3>
            <p className="text-[var(--text-secondary)]">
              Save items you like to view them later
            </p>
            <Link to="/items" className="btn btn-primary mt-2">
              <ShoppingBag size={18} /> Browse Items
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {items.map((item) => (
              <ItemLayout
                key={item._id}
                item_info={item}
                onWishlistChange={handleWishlistChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
