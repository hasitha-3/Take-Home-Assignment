import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  X,
  Package,
  CheckCircle,
  KeyRound,
  ShoppingCart,
  PartyPopper,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Navbar from "../Home/Navbar";
import api from "../../api";
import { getImageUrl } from "../../utils/categoryImages";
import { useAppContext } from "../../MyContext";

export default function Cart() {
  const { info, refreshCartCount } = useAppContext();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState(info.address || "");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await api.get("/cart");
      setCartItems(res.data.items || []);
    } catch {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const updateQty = async (id, qty) => {
    if (qty <= 0) {
      removeItem(id);
      return;
    }
    try {
      const res = await api.put(`/cart/update/${id}`, { quantity: qty });
      setCartItems((prev) =>
        prev.map((i) => (i._id === id ? res.data.item : i)),
      );
      refreshCartCount();
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const removeItem = async (id) => {
    try {
      await api.delete(`/cart/remove/${id}`);
      setCartItems((prev) => prev.filter((i) => i._id !== id));
      toast("Item removed from cart");
      refreshCartCount();
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty!");
      return;
    }
    if (!address.trim()) {
      toast.error("Enter delivery address");
      return;
    }

    setPlacing(true);
    try {
      const res = await api.post("/orders/create", {
        cartItemIds: cartItems.map((i) => i._id),
        shippingAddress: address,
      });

      const { order } = res.data;

      toast.success("Order placed successfully!");
      setCartItems([]);
      refreshCartCount();

      navigate("/orders");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  const total = cartItems.reduce((sum, i) => sum + i.itemprice * i.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="page-container py-8">
          <div className="skeleton h-12 w-64 rounded-xl mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-28 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="page-container py-16">
          <div className="empty-state">
            <span className="empty-state-icon">
              <ShoppingCart
                size={64}
                className="text-[var(--text-muted)] mx-auto"
              />
            </span>
            <h2 className="hero-title text-3xl text-[var(--text-primary)]">
              Your cart is empty
            </h2>
            <p className="text-[var(--text-secondary)]">
              Add items to get started!
            </p>
            <Link to="/items" className="btn btn-primary btn-lg mt-2">
              <ShoppingBag size={18} /> Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="page-container py-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-icon"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="hero-title text-3xl text-[var(--text-primary)]">
            Shopping Cart{" "}
            <span className="text-[var(--text-muted)] text-xl">
              ({cartItems.length})
            </span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Cart Items ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="glass-card animate-fadeIn"
                style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}
              >
                {/* Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-[var(--surface-2)] flex-shrink-0">
                  <img
                    src={getImageUrl(item.imageUrl, item.itemcategory)}
                    alt={item.itemname}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[var(--text-primary)] capitalize truncate">
                    {item.itemname}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mb-2">
                    {item.itemcategory}
                  </p>

                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Quantity */}
                    <div className="flex items-center border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--surface)]">
                      <button
                        onClick={() => updateQty(item._id, item.quantity - 1)}
                        style={{ width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        className="hover:bg-[var(--surface-2)] transition-colors text-lg font-medium"
                      >
                        −
                      </button>
                      <span className="font-semibold text-center border-x border-[var(--border)]" style={{ minWidth: '3rem', padding: '0.5rem 0' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item._id, item.quantity + 1)}
                        style={{ width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        className="hover:bg-[var(--surface-2)] transition-colors text-lg font-medium"
                      >
                        +
                      </button>
                    </div>

                    <p className="font-bold text-[var(--brand)]">
                      ₹
                      {(item.itemprice * item.quantity).toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      ₹{item.itemprice.toLocaleString("en-IN")} each
                    </p>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item._id)}
                  className="btn btn-ghost btn-icon flex-shrink-0 text-[var(--danger)]"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* ── Order Summary ───────────────────────────────────────────── */}
          <div className="glass-card h-fit sticky top-24" style={{ padding: '1.5rem' }}>
            <h2 className="hero-title text-xl text-[var(--text-primary)] mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">
                  Items ({cartItems.length})
                </span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Delivery</span>
                <span className="text-[var(--success)] font-semibold">Free</span>
              </div>
              <div className="divider" />
              <div className="flex justify-between">
                <span className="font-bold">Total</span>
                <span className="text-xl font-bold text-[var(--brand)]">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Delivery address */}
            <div className="field-group">
              <label className="field-label">Delivery Address</label>
              <textarea
                className="field text-sm"
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, city, country..."
              />
            </div>

            <button
              onClick={handleCheckout}
              disabled={placing}
              className="btn btn-primary btn-lg w-full mt-2"
            >
              {placing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Placing Order...
                </span>
              ) : (
                `Place Order · ₹${total.toLocaleString("en-IN")}`
              )}
            </button>

            <Link
              to="/items"
              className="block text-center text-sm text-[var(--text-muted)] hover:text-[var(--brand)] mt-3 transition-colors"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
