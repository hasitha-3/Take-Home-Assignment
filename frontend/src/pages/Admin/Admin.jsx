import React, { useEffect, useState } from "react";
import {
  Users,
  ShoppingBag,
  Package,
  TrendingUp,
  Search,
  ShieldOff,
  Shield,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Navbar from "../Home/Navbar";
import api from "../../api";
import { useAppContext } from "../../MyContext";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const { info } = useAppContext();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!info.isAdmin) {
      toast.error("Unauthorized");
      navigate("/home");
      return;
    }
    fetchData();
  }, [info.isAdmin, navigate]);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users?limit=50"),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
    } catch {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/toggle`);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isActive: res.data.user.isActive } : u,
        ),
      );
      toast.success(res.data.message);
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="page-container py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="skeleton w-full rounded-2xl h-40" />
            <div className="skeleton w-full rounded-2xl h-40" />
            <div className="skeleton w-full rounded-2xl h-40" />
          </div>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.Email.toLowerCase().includes(search.toLowerCase()) ||
      u.firstname.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="page-container py-6">
        <h1 className="hero-title text-3xl text-[var(--text-primary)] mb-6">
          Admin Dashboard
        </h1>

        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Users",
              val: stats.stats.totalUsers,
              icon: <Users size={24} />,
              color: "text-blue-500",
              bg: "bg-blue-500/10",
            },
            {
              label: "Active Items",
              val: stats.stats.totalItems,
              icon: <ShoppingBag size={24} />,
              color: "text-emerald-500",
              bg: "bg-emerald-500/10",
            },
            {
              label: "Total Orders",
              val: stats.stats.totalOrders,
              icon: <Package size={24} />,
              color: "text-indigo-500",
              bg: "bg-indigo-500/10",
            },
            {
              label: "Total Revenue",
              val: `₹${stats.stats.totalRevenue.toLocaleString()}`,
              icon: <TrendingUp size={24} />,
              color: "text-amber-500",
              bg: "bg-amber-500/10",
            },
          ].map((s, i) => (
            <div key={i} className="glass-card p-5 flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.bg} ${s.color}`}
              >
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                  {s.label}
                </p>
                <p className="hero-title text-2xl text-[var(--text-primary)]">
                  {s.val}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Users Management ───────────────────────────────────────────── */}
          <div className="lg:col-span-2 glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-[var(--text-primary)]">
                User Management
              </h2>
              <div className="relative w-64">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  type="text"
                  className="field pl-8 h-9 text-sm"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-secondary)]">
                    <th className="py-2 px-3 font-semibold">User</th>
                    <th className="py-2 px-3 font-semibold">Email</th>
                    <th className="py-2 px-3 font-semibold">Role</th>
                    <th className="py-2 px-3 font-semibold">Status</th>
                    <th className="py-2 px-3 font-semibold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)]"
                    >
                      <td className="py-2 px-3 flex items-center gap-2">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            className="w-8 h-8 rounded-full object-cover"
                            alt=""
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[var(--brand)] text-white flex items-center justify-center font-bold text-xs">
                            {user.firstname[0]}
                          </div>
                        )}
                        <span className="font-medium">
                          {user.firstname} {user.lastname}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-[var(--text-secondary)]">
                        {user.Email}
                      </td>
                      <td className="py-2 px-3">
                        {user.isAdmin ? (
                          <span className="badge badge-brand">Admin</span>
                        ) : (
                          <span className="badge badge-gray">User</span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {user.isActive ? (
                          <span className="badge badge-success">Active</span>
                        ) : (
                          <span className="badge badge-danger">Suspended</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {!user.isAdmin && (
                          <button
                            onClick={() => toggleUserStatus(user._id)}
                            className={`btn btn-sm ${user.isActive ? "btn-danger" : "btn-primary"}`}
                          >
                            {user.isActive ? (
                              <ShieldOff size={14} />
                            ) : (
                              <Shield size={14} />
                            )}
                            {user.isActive ? "Suspend" : "Activate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <p className="text-center py-4 text-[var(--text-muted)]">
                  No users found
                </p>
              )}
            </div>
          </div>

          {/* ── Recent Orders ────────────────────────────────────────────── */}
          <div className="glass-card p-6">
            <h2 className="font-bold text-lg text-[var(--text-primary)] mb-4">
              Recent Orders
            </h2>
            <div className="space-y-4">
              {stats.recentOrders.map((o) => (
                <div
                  key={o._id}
                  className="flex justify-between items-start pb-3 border-b border-[var(--border)] last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-mono text-sm font-semibold">
                      {o.orderNumber}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      By {o.buyer_id?.firstname}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {new Date(o.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[var(--brand)] text-sm">
                      ₹{o.totalPrice.toLocaleString()}
                    </p>
                    <span className="badge badge-gray text-[10px] mt-1">
                      {o.deliveryStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
