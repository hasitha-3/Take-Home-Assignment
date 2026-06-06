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
      <div className="w-full max-w-md animate-fadeIn z-10 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <Link
            to="/home"
            className="text-3xl font-bold text-indigo-600 tracking-tight inline-block mb-1"
          >
            BuySell
          </Link>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">
            Global Marketplace
          </p>

          <h2 className="text-2xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            Don't have an account?{" "}
            <Link
              to="/registration"
              className="text-indigo-600 font-semibold hover:underline"
            >
              Create one free
            </Link>
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="field-group">
            <label className="field-label">Email address</label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="email"
                className="field pl-9"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Password</label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type={showPwd ? "text" : "password"}
                className="field pl-9 pr-10"
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
            className="btn btn-primary btn-lg w-full mt-2"
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

      {/* Demo credentials */}
      <div className="w-full max-w-md mt-6 p-5 rounded-xl border border-indigo-100 bg-indigo-50/50 text-sm text-gray-600">
        <div className="flex items-center gap-2 mb-2">
          <Lock size={14} className="text-indigo-500" />
          <p className="font-semibold text-[var(--text-primary)]">
            Demo credentials
          </p>
        </div>
        <p className="mb-1">
          Email:{" "}
          <code className="text-indigo-500 font-mono bg-indigo-50 px-1.5 py-0.5 rounded">
            aryan.mehta@example.com
          </code>
        </p>
        <p>
          Password:{" "}
          <code className="text-indigo-500 font-mono bg-indigo-50 px-1.5 py-0.5 rounded">
            Aryan@123
          </code>
        </p>
      </div>
    </div>
  );
}
