import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import api from "../../api";
import { useAppContext } from "../../MyContext";

export default function Registration() {
  const navigate = useNavigate();
  const { change_info } = useAppContext();

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    Email: "",
    contact_number: "",
    age: "",
    password: "",
    confirm: "",
    address: "",
    city: "New York",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.firstname.trim() || !form.lastname.trim())
      return toast.error("Enter your full name");
    if (!form.Email.includes("@")) return toast.error("Enter a valid email");
    if (!/^\d{10}$/.test(form.contact_number))
      return toast.error("Contact number must be 10 digits");
    if (!form.age || Number(form.age) < 1 || Number(form.age) > 120)
      return toast.error("Enter a valid age");
    if (form.password.length < 6)
      return toast.error("Password must be at least 6 characters");
    if (form.password !== form.confirm)
      return toast.error("Passwords do not match");

    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
        Email: form.Email.trim(),
        contact_number: form.contact_number,
        age: Number(form.age),
        password: form.password,
        address: form.address || "",
        city: form.city,
      });

      toast.success("Account created! Please log in.");
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--bg-page)]">
      <div className="w-full max-w-2xl animate-fadeIn z-10 glass-card shadow-xl" style={{ padding: '2rem' }}>
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/login"
            className="text-3xl font-bold text-[var(--brand)] tracking-tight inline-block mb-1"
          >
            BuySell
          </Link>

          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            Create your account
          </h2>
          <p className="text-[var(--text-secondary)] mt-2 text-sm">
            Already a member?{" "}
            <Link
              to="/login"
              className="text-[var(--brand)] font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="field-group mb-0">
              <label className="field-label">First Name</label>
              <div className="relative">
                <User
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  className="field pl-9"
                  placeholder="Aryan"
                  value={form.firstname}
                  onChange={set("firstname")}
                  required
                />
              </div>
            </div>
            <div className="field-group mb-0">
              <label className="field-label">Last Name</label>
              <input
                className="field"
                placeholder="Mehta"
                value={form.lastname}
                onChange={set("lastname")}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="field-group">
            <label className="field-label">Email</label>
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="email"
                className="field pl-9"
                placeholder="you@example.com"
                value={form.Email}
                onChange={set("Email")}
                required
              />
            </div>
          </div>

          {/* Phone + Age row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="field-group mb-0">
              <label className="field-label">Phone Number</label>
              <div className="relative">
                <Phone
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  type="tel"
                  className="field pl-9"
                  placeholder="10-digit mobile"
                  value={form.contact_number}
                  onChange={set("contact_number")}
                  maxLength={10}
                  required
                />
              </div>
            </div>
            <div className="field-group mb-0">
              <label className="field-label">Age</label>
              <input
                type="number"
                className="field"
                placeholder="21"
                min={1}
                max={120}
                value={form.age}
                onChange={set("age")}
                required
              />
            </div>
          </div>

          {/* Address + College */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="field-group mb-0">
              <label className="field-label">Address</label>
              <div className="relative">
                <MapPin
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  className="field pl-9"
                  placeholder="123 Main St"
                  value={form.address}
                  onChange={set("address")}
                />
              </div>
            </div>
            <div className="field-group mb-0">
              <label className="field-label">City / Region</label>
              <input
                className="field"
                value={form.city}
                onChange={set("city")}
                placeholder="New York"
              />
            </div>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="field-group mb-0">
              <label className="field-label">Password</label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  type={showPwd ? "text" : "password"}
                  className="field pl-9 pr-10"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={set("password")}
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  onClick={() => setShowPwd(!showPwd)}
                >
                </button>
              </div>
            </div>
            <div className="field-group mb-0">
              <label className="field-label">Confirm Password</label>
              <div className="relative">
                <ShieldCheck
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  type={showConf ? "text" : "password"}
                  className="field pl-9 pr-10"
                  placeholder="Repeat password"
                  value={form.confirm}
                  onChange={set("confirm")}
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  onClick={() => setShowConf(!showConf)}
                >
                  {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.confirm && form.confirm !== form.password && (
                <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>
                  Passwords don't match
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Creating account...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Create Free Account <ArrowRight size={18} />
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
