import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Navbar from "../Home/Navbar";
import api from "../../api";
import { getImageUrl } from "../../utils/categoryImages";

function OrderStatusBadge() {
  return (
    <span className="badge status-delivered gap-1 text-xs">
      <CheckCircle size={16} /> Completed
    </span>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="page-container py-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="hero-title text-3xl text-[var(--text-primary)]">
            My Orders
          </h1>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-40 rounded-2xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">
              <Package size={64} className="text-[var(--text-muted)] mx-auto" />
            </span>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              No orders found
            </h3>
            <p className="text-[var(--text-secondary)]">
              You haven't placed any orders yet
            </p>
            <Link to="/items" className="btn btn-primary mt-2">
              Browse Items
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orders.map((order) => (
              <div key={order._id} className="glass-card animate-fadeIn" style={{ padding: '1.5rem' }}>
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-sm text-[var(--text-muted)] mb-0.5">
                      Order Number
                    </p>
                    <p className="font-mono font-bold text-xl text-[var(--text-primary)]">
                      {order.orderNumber}
                    </p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
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
                    <OrderStatusBadge />
                    <p className="hero-title text-3xl text-[var(--brand)] mt-2">
                      ₹{order.totalPrice.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="mt-6 space-y-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex gap-6 p-6 items-center border border-[var(--surface-2)] rounded-xl bg-[var(--surface)]">
                      <img
                        src={getImageUrl(item.imageUrl, item.itemcategory)}
                        className="w-32 h-32 rounded-xl object-cover"
                        alt=""
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-2xl capitalize truncate text-[var(--text-primary)]">
                          {item.itemname}
                        </p>
                        <p className="text-lg font-medium text-[var(--text-muted)] mt-2">
                          Qty: {item.quantity} · ₹
                          {item.itemprice.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
