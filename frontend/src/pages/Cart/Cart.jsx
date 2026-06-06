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

function OTPModal({ order, onClose }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const verify = async () => {
    if (otp.length !== 6) {
      toast.error("Enter 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      await api.post(`/orders/${order._id}/verify-otp`, { otp });
      toast.success(
        <span>
          Delivery confirmed! <CheckCircle size={14} className="inline" />
        </span>,
      );
      onClose();
      navigate("/orders");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg">Confirm Delivery</h3>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Enter the 6-digit delivery OTP from your order confirmation. Your
          delivery OTP was sent when the order was placed.
        </p>
        <div className="field-group">
          <label className="field-label">Delivery OTP</label>
          <input
            type="text"
            className="field text-center tracking-widest text-2xl font-bold"
            placeholder="_ _ _ _ _ _"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          />
        </div>
        <button
          onClick={verify}
          disabled={loading || otp.length !== 6}
          className="btn btn-primary w-full mt-4"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            "Confirm Delivery"
          )}
        </button>
      </div>
    </div>
  );
}

export default function Cart() {
  const { info, refreshCartCount } = useAppContext();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [otpOrder, setOtpOrder] = useState(null);
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

      const { order, deliveryOTP, deliveryPartner } = res.data;

      toast.success(
        <span>
          Order placed! <PartyPopper size={14} className="inline" /> OTP:{" "}
          {deliveryOTP}
        </span>,
      );
      setCartItems([]);
      refreshCartCount();

      // Show OTP info in a nice alert
      setTimeout(() => {
        toast(
          (t) => (
            <div>
              <p className="font-bold mb-1 flex items-center gap-1">
                <Package size={14} /> Delivery Partner: {deliveryPartner.name}
              </p>
              <p className="text-sm">Phone: {deliveryPartner.phone}</p>
              <p className="font-mono text-lg text-center mt-2 font-bold tracking-widest flex items-center justify-center gap-2">
                <KeyRound size={18} /> OTP: {deliveryOTP}
              </p>
              <p className="text-xs text-center text-gray-500 mt-1">
                Share this OTP only with your delivery partner
              </p>
            </div>
          ),
          { duration: 10000, id: "otp-toast" },
        );
      }, 500);

      navigate("/orders");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  const total = cartItems.reduce((sum, i) => sum + i.itemprice * i.quantity, 0);
  const saving = Math.round(total * 0.05); // Simulated 5% discount

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
              <ShoppingBag size={18} /> Browse Listings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      {otpOrder && (
        <OTPModal order={otpOrder} onClose={() => setOtpOrder(null)} />
      )}

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
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="glass-card p-4 flex gap-4 items-start animate-fadeIn"
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
                    <div className="flex items-center border border-[var(--border)] rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQty(item._id, item.quantity - 1)}
                        className="px-2 py-1 hover:bg-[var(--surface-2)]"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 py-1 font-semibold text-sm min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item._id, item.quantity + 1)}
                        className="px-2 py-1 hover:bg-[var(--surface-2)]"
                      >
                        <Plus size={14} />
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
          <div className="glass-card p-6 h-fit sticky top-24">
            <h2 className="hero-title text-xl text-[var(--text-primary)] mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">
                  Subtotal ({cartItems.length} items)
                </span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">
                  Platform Discount (5%)
                </span>
                <span className="text-[var(--success)]">
                  −₹{saving.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Delivery</span>
                <span className="text-[var(--success)] font-semibold flex items-center gap-1">
                  FREE <PartyPopper size={14} />
                </span>
              </div>
              <div className="divider" />
              <div className="flex justify-between">
                <span className="font-bold">Total</span>
                <span className="hero-title text-2xl text-[var(--brand)]">
                  ₹{(total - saving).toLocaleString("en-IN")}
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
                `Place Order · ₹${(total - saving).toLocaleString("en-IN")}`
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
