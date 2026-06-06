import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Star,
  Package,
  Tag,
  Edit3,
  Save,
  X,
  Camera,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Navbar from "../Home/Navbar";
import api from "../../api";
import { useAppContext } from "../../MyContext";

function StarRating({ value }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          style={{
            color:
              s <= Math.round(value) ? "var(--accent)" : "var(--surface-3)",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function Profile() {
  const { userId } = useParams();
  const { info, change_info } = useAppContext();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPwdChange, setShowPwdChange] = useState(false);
  const [form, setForm] = useState({});
  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const isOwn = userId === info.userId;

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/profile/${userId}`);
        setProfile(res.data);
        setForm({
          firstname: res.data.firstname,
          lastname: res.data.lastname,
          bio: res.data.bio || "",
          address: res.data.address || "",
          college: res.data.college || "",
          contact_number: res.data.contact_number,
          age: res.data.age,
        });
      } catch {
        toast.error("User not found");
        navigate("/home");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/profile/${userId}`, form);
      setProfile({ ...profile, ...res.data.user });
      if (isOwn) change_info({ ...info, ...res.data.user });
      setEditing(false);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("avatar", file);
    try {
      const res = await api.post(`/profile/${userId}/avatar`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile((p) => ({ ...p, avatar: res.data.avatar }));
      if (isOwn) change_info({ ...info, avatar: res.data.avatar });
      toast.success("Avatar updated!");
    } catch {
      toast.error("Failed to upload avatar");
    }
  };

  const handlePasswordChange = async () => {
    if (!pwdForm.currentPassword || !pwdForm.newPassword) {
      toast.error("Both passwords required");
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    try {
      await api.put(`/profile/${userId}/password`, pwdForm);
      toast.success("Password changed!");
      setShowPwdChange(false);
      setPwdForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="page-container py-8 space-y-4">
          <div className="skeleton h-40 rounded-2xl" />
          <div className="skeleton h-60 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="page-container py-6 max-w-3xl">
        {/* ── Header Card ──────────────────────────────────────────────── */}
        <div className="glass-card p-6 mb-5 animate-fadeIn">
          <div className="flex items-start gap-5 flex-wrap">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-3xl font-bold">
                    {profile.firstname?.[0]}
                  </span>
                )}
              </div>
              {isOwn && (
                <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--brand)] flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
                  <Camera size={13} className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </label>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="hero-title text-2xl text-[var(--text-primary)]">
                  {profile.firstname} {profile.lastname}
                </h1>
                {profile.isOnline && (
                  <span className="badge badge-success">Online</span>
                )}
                {profile.isAdmin && (
                  <span className="badge badge-brand">
                    <Shield size={10} /> Admin
                  </span>
                )}
              </div>

              <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                ID: {profile._id}
              </p>

              {profile.sellerRating > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <StarRating value={profile.sellerRating} />
                  <span className="text-sm font-semibold">
                    {profile.sellerRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    ({profile.totalRatings} ratings)
                  </span>
                </div>
              )}

              {profile.bio && (
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Edit button */}
            {isOwn && (
              <button
                onClick={() => setEditing(!editing)}
                className={`btn btn-sm ${editing ? "btn-ghost" : "btn-secondary"} flex-shrink-0`}
              >
                {editing ? (
                  <>
                    <X size={14} /> Cancel
                  </>
                ) : (
                  <>
                    <Edit3 size={14} /> Edit Profile
                  </>
                )}
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-[var(--border)]">
            {[
              {
                icon: <Tag size={16} />,
                label: "Items Listed",
                val: profile.stats?.itemsListed || 0,
              },
              {
                icon: <Package size={16} />,
                label: "Orders Made",
                val: profile.stats?.ordersMade || 0,
              },
              {
                icon: <GraduationCap size={16} />,
                label: "Member Since",
                val: new Date(profile.createdAt).toLocaleDateString("en-IN", {
                  month: "short",
                  year: "numeric",
                }),
              },
            ].map(({ icon, label, val }) => (
              <div
                key={label}
                className="text-center p-3 rounded-xl bg-[var(--surface-2)]"
              >
                <div className="flex justify-center text-[var(--brand)] mb-1">
                  {icon}
                </div>
                <p className="hero-title text-xl text-[var(--text-primary)]">
                  {val}
                </p>
                <p className="text-xs text-[var(--text-muted)]">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Contact Info ─────────────────────────────────────────────── */}
        <div className="glass-card p-6 mb-5">
          <h2 className="font-bold text-[var(--text-primary)] mb-4">
            Contact & Details
          </h2>
          <div className="space-y-3 text-sm">
            {[
              { icon: <Mail size={15} />, label: "Email", val: profile.Email },
              {
                icon: <Phone size={15} />,
                label: "Phone",
                val: profile.contact_number,
              },
              {
                icon: <MapPin size={15} />,
                label: "Location",
                val: profile.address,
              },
              {
                icon: <GraduationCap size={15} />,
                label: "College",
                val: profile.college,
              },
              {
                icon: <User size={15} />,
                label: "Age",
                val: `${profile.age} years`,
              },
            ].map(
              ({ icon, label, val }) =>
                val && (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-[var(--brand)] flex-shrink-0">
                      {icon}
                    </span>
                    <span className="text-[var(--text-muted)] w-16 flex-shrink-0 text-xs uppercase font-bold tracking-wide">
                      {label}
                    </span>
                    <span className="text-[var(--text-primary)]">{val}</span>
                  </div>
                ),
            )}
          </div>
        </div>

        {/* ── Edit Form ─────────────────────────────────────────────────── */}
        {editing && (
          <div className="glass-card p-6 mb-5 animate-scaleIn">
            <h2 className="font-bold text-[var(--text-primary)] mb-4">
              Edit Profile
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { k: "firstname", l: "First Name", ph: "Aryan" },
                { k: "lastname", l: "Last Name", ph: "Mehta" },
                { k: "contact_number", l: "Phone", ph: "9876543210" },
                { k: "age", l: "Age", ph: "21", type: "number" },
                { k: "address", l: "Address", ph: "123 Main St, New York" },
                { k: "city", l: "City", ph: "New York" },
              ].map(({ k, l, ph, type = "text" }) => (
                <div key={k} className="field-group mb-0">
                  <label className="field-label">{l}</label>
                  <input
                    type={type}
                    className="field"
                    placeholder={ph}
                    value={form[k] || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [k]: e.target.value }))
                    }
                  />
                </div>
              ))}

              <div className="field-group mb-0 sm:col-span-2">
                <label className="field-label">Bio</label>
                <textarea
                  className="field"
                  rows={3}
                  maxLength={300}
                  placeholder="Tell buyers about yourself..."
                  value={form.bio || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bio: e.target.value }))
                  }
                />
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {(form.bio || "").length}/300
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={14} /> Save Changes
                  </>
                )}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Change Password (own profile only) ───────────────────────── */}
        {isOwn && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-[var(--text-primary)]">Security</h2>
              <button
                onClick={() => setShowPwdChange(!showPwdChange)}
                className="btn btn-ghost btn-sm"
              >
                {showPwdChange ? "Cancel" : "Change Password"}
              </button>
            </div>

            {showPwdChange && (
              <div className="space-y-4 animate-scaleIn">
                {[
                  { k: "currentPassword", l: "Current Password" },
                  { k: "newPassword", l: "New Password (min 6 chars)" },
                ].map(({ k, l }) => (
                  <div key={k} className="field-group mb-0">
                    <label className="field-label">{l}</label>
                    <input
                      type="password"
                      className="field"
                      placeholder="••••••••"
                      value={pwdForm[k]}
                      onChange={(e) =>
                        setPwdForm((f) => ({ ...f, [k]: e.target.value }))
                      }
                    />
                  </div>
                ))}
                <button
                  onClick={handlePasswordChange}
                  className="btn btn-primary btn-sm"
                >
                  <Shield size={14} /> Update Password
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
