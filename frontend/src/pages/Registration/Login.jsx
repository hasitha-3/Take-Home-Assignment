import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock, ShoppingBag, ArrowRight } from "lucide-react";
import api from "../../api";
import { useAppContext } from "../../MyContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { change_info } = useAppContext();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", { Email: email, password });
      const { token, userInfo } = res.data;

      localStorage.setItem("userToken", token);
      localStorage.setItem("userId", userInfo._id);

      change_info(userInfo);
      toast.success(`Welcome back, ${userInfo.firstname}!`);
      navigate("/home");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Login failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-lg animate-fadeIn z-10 bg-white p-10 md:p-14 rounded-[2rem] shadow-2xl border border-gray-100">
        <div className="text-center mb-10">
          <Link
            to="/home"
            className="text-4xl font-extrabold text-indigo-600 tracking-tight inline-block mb-2"
          >
            BuySell
          </Link>
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8">
            Global Marketplace
          </p>

          <h2 className="text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="text-gray-500 mt-3 text-base">
            Don't have an account?{" "}
            <Link
              to="/registration"
              className="text-indigo-600 font-semibold hover:underline"
            >
              Create one free
            </Link>
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="field-group">
            <label className="field-label text-base">Email address</label>
            <div className="relative mt-2">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="email"
                className="field pl-9 py-3"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label text-base">Password</label>
            <div className="relative mt-2">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type={showPwd ? "text" : "password"}
                className="field pl-9 pr-10 py-3"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                onClick={() => setShowPwd(!showPwd)}
                tabIndex={-1}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg w-full mt-4 py-4 text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Enter Marketplace <ArrowRight size={18} />
              </span>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-[var(--text-muted)] mt-6">
          By signing in you agree to our{" "}
          <Link to="/contact" className="hover:underline text-indigo-400">
            Terms of Service
          </Link>
        </p>
      </div>

    </div>
  );
}
