import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  CheckCircle,
  Clock,
  X,
  Truck,
  MapPin,
  KeyRound,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Navbar from "../Home/Navbar";
import api from "../../api";
import { getImageUrl } from "../../utils/categoryImages";

const STATUS_STEPS = [
  "Processing",
  "Confirmed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];
const STATUS_ICONS = {
  Processing: <Clock size={16} />,
  Confirmed: <CheckCircle size={16} />,
  Shipped: <Package size={16} />,
  "Out for Delivery": <Truck size={16} />,
  Delivered: <CheckCircle size={16} />,
  Cancelled: <X size={16} />,
};

function OrderStatusBadge({ status }) {
  const cls =
    {
      Processing: "status-processing",
      Confirmed: "status-confirmed",
      Shipped: "status-shipped",
      "Out for Delivery": "status-out-delivery",
      Delivered: "status-delivered",
      Cancelled: "status-cancelled",
      Returned: "status-returned",
    }[status] || "badge-gray";

  return (
    <span className={`badge ${cls} gap-1 text-xs`}>
      {STATUS_ICONS[status]} {status}
    </span>
  );
}

function OrderTimeline({ status }) {
  const stepIdx = STATUS_STEPS.indexOf(status);
  if (status === "Cancelled")
    return (
      <div className="flex items-center gap-2 text-sm text-[var(--danger)]">
        <X size={16} /> Order Cancelled
      </div>
    );

  return (
    <div className="flex items-center gap-1 flex-wrap mt-3">
      {STATUS_STEPS.map((step, i) => (
        <React.Fragment key={step}>
          <div
            className={`flex items-center gap-1 text-xs font-medium transition-colors ${
              i <= stepIdx
                ? "text-[var(--success)]"
                : "text-[var(--text-muted)]"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                i < stepIdx
                  ? "bg-[var(--success)] text-white"
                  : i === stepIdx
                    ? "bg-[var(--brand)] text-white ring-2 ring-[var(--brand-glow)]"
                    : "bg-[var(--surface-2)] text-[var(--text-muted)]"
              }`}
            >
              {i < stepIdx ? "✓" : i + 1}
            </div>
            <span className="hidden sm:inline">{step}</span>
          </div>
          {i < STATUS_STEPS.length - 1 && (
            <div
              className={`flex-1 h-0.5 min-w-3 rounded-full ${i < stepIdx ? "bg-[var(--success)]" : "bg-[var(--surface-2)]"}`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/my");
      setOrders(res.data.orders || []);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }
    try {
      await api.post(`/orders/${orderId}/cancel`, { reason: cancelReason });
      toast.success("Order cancelled");
      setCancellingId(null);
      setCancelReason("");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cannot cancel this order");
    }
  };

  const filteredOrders = filter
    ? orders.filter((o) => o.deliveryStatus === filter)
    : orders;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="page-container py-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="hero-title text-3xl text-[var(--text-primary)]">
            My Orders
          </h1>
          <select
            className="field w-auto text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All Orders</option>
            {[...STATUS_STEPS, "Cancelled"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-40 rounded-2xl" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">
              <Package size={64} className="text-[var(--text-muted)] mx-auto" />
            </span>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              No orders found
            </h3>
            <p className="text-[var(--text-secondary)]">
              {filter
                ? `No ${filter} orders`
                : "You haven't placed any orders yet"}
            </p>
            <Link to="/items" className="btn btn-primary mt-2">
              Browse Items
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order._id} className="glass-card p-5 animate-fadeIn">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-0.5">
                      Order Number
                    </p>
                    <p className="font-mono font-bold text-[var(--text-primary)]">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <OrderStatusBadge status={order.deliveryStatus} />
                    <p className="hero-title text-xl text-[var(--brand)] mt-1">
                      ₹{order.totalPrice.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                <OrderTimeline status={order.deliveryStatus} />

                {/* Items */}
                <div className="mt-4 space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 items-center">
                      <img
                        src={getImageUrl(item.imageUrl, item.itemcategory)}
                        className="w-16 h-16 rounded-xl object-cover"
                        alt=""
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold capitalize truncate">
                          {item.itemname}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          Qty: {item.quantity} · ₹
                          {item.itemprice.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery info */}
                {order.deliveryPartner?.name && (
                  <div className="mt-4 p-3 rounded-xl bg-[var(--surface-2)] text-sm">
                    <p className="font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-1">
                      <Truck size={14} /> Delivery Partner
                    </p>
                    <p className="text-[var(--text-secondary)]">
                      {order.deliveryPartner.name} ·{" "}
                      {order.deliveryPartner.phone}
                    </p>
                    {order.shippingAddress && (
                      <p className="flex items-center gap-1 text-[var(--text-muted)] mt-1">
                        <MapPin size={12} /> {order.shippingAddress}
                      </p>
                    )}
                  </div>
                )}

                {/* OTP display for Processing/Shipped orders */}
                {order.deliveryOTP &&
                  !order.otpVerified &&
                  order.deliveryStatus !== "Cancelled" && (
                    <div className="mt-3 p-3 rounded-xl border border-[var(--brand)] bg-[var(--brand-glow)]">
                      <p className="text-xs font-bold text-[var(--brand)] mb-1 flex items-center gap-1">
                        <KeyRound size={12} /> Your Delivery OTP
                      </p>
                      <p className="font-mono text-2xl font-bold tracking-widest text-[var(--text-primary)]">
                        {order.deliveryOTP}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Share this only with your delivery partner
                      </p>
                    </div>
                  )}

                {/* Actions */}
                <div className="flex gap-2 mt-4 flex-wrap">
                  {["Processing", "Confirmed"].includes(order.deliveryStatus) &&
                    (cancellingId === order._id ? (
                      <div className="w-full space-y-2">
                        <textarea
                          className="field text-sm"
                          rows={2}
                          placeholder="Reason for cancellation (required)"
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCancel(order._id)}
                            className="btn btn-danger btn-sm"
                          >
                            Confirm Cancel
                          </button>
                          <button
                            onClick={() => {
                              setCancellingId(null);
                              setCancelReason("");
                            }}
                            className="btn btn-ghost btn-sm"
                          >
                            Go Back
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setCancellingId(order._id)}
                        className="btn btn-danger btn-sm"
                      >
                        <X size={14} /> Cancel Order
                      </button>
                    ))}
                  {order.deliveryStatus === "Cancelled" &&
                    order.cancellationReason && (
                      <p className="text-xs text-[var(--text-muted)] italic">
                        Reason: {order.cancellationReason}
                      </p>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
