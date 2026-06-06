import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Clock,
  History as HistoryIcon,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Navbar from "../Home/Navbar";
import api from "../../api";
import { getImageUrl } from "../../utils/categoryImages";

export default function History() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/orders/my?status=Delivered");
        setOrders(res.data.orders || []);
      } catch {
        toast.error("Failed to load order history");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="page-container py-6">
        <h1 className="hero-title text-3xl text-[var(--text-primary)] mb-6">
          Order History
        </h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-32 rounded-2xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">
              <HistoryIcon
                size={64}
                className="text-[var(--text-muted)] mx-auto"
              />
            </span>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              No delivery history yet
            </h3>
            <p className="text-[var(--text-secondary)]">
              Completed orders will appear here
            </p>
            <Link to="/items" className="btn btn-primary mt-2">
              Browse Items
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="glass-card p-5 animate-fadeIn">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-mono font-bold text-[var(--text-primary)]">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                      <Clock size={11} />
                      Delivered on{" "}
                      {new Date(
                        order.deliveredAt || order.updatedAt,
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="badge status-delivered flex items-center gap-1">
                      <CheckCircle size={12} /> Delivered
                    </span>
                    <p className="hero-title text-xl text-[var(--brand)] mt-1">
                      ₹{order.totalPrice.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex gap-3 items-center text-sm">
                      <img
                        src={getImageUrl(item.imageUrl, item.itemcategory)}
                        className="w-10 h-10 rounded-lg object-cover"
                        alt=""
                      />
                      <div>
                        <p className="font-semibold capitalize">
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

                <div className="mt-3 pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)] flex flex-wrap gap-3">
                  <span>
                    Ordered:{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </span>
                  {order.deliveryPartner?.name && (
                    <span>Partner: {order.deliveryPartner.name}</span>
                  )}
                  <span>Address: {order.shippingAddress}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
