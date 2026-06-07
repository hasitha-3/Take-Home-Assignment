import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  Bell,
  Home,
  Package,
  BookHeart,
  User,
  LogOut,
  Search,
  Sun,
  Moon,
  Menu,
  X,
  Store,
  LayoutDashboard,
  Phone,
  Tag,
  SlidersHorizontal,
} from "lucide-react";
import { useAppContext } from "../../MyContext";
import api from "../../api";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { info, clearInfo, cartCount, unreadNotifs, theme, toggleTheme } =
    useAppContext();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const inputRef = useRef(null);

  const categories = [
    "All",
    ...[
      "Electronics",
      "Books",
      "Clothing",
      "Fitness",
      "Stationery",
      "Food",
      "Gaming",
      "Home & Living",
      "Sports",
      "Beauty & Care",
    ].sort()
  ];

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [location.pathname]);

  const handleSearch = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (category && category !== "All") params.set("category", category);
    navigate(`/items?${params.toString()}`);
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    const params = new URLSearchParams();
    if (cat !== "All") params.set("category", cat);
    navigate(`/items?${params.toString()}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/login/logout", { userId: info.userId });
    } catch {}
    clearInfo();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        className={`glass-nav w-full flex items-center justify-between px-6 py-3 transition-all duration-300 ${scrolled ? "shadow-md" : ""}`}
        style={{ position: "sticky", top: 0, zIndex: 100, borderBottom: "none" }}
      >
        {/* Brand */}
        <Link
          to="/home"
          className="nav-brand mr-4 flex-shrink-0 text-2xl font-bold"
        >
          BuySell
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1 flex-shrink-0">
          <Link
            to="/home"
            className={`nav-link ${isActive("/home") ? "active" : ""}`}
          >
            <Home size={15} className="mr-1.5" /> Home
          </Link>
          <Link
            to="/my-products"
            className={`nav-link ${isActive("/my-products") ? "active" : ""}`}
          >
            <Store size={15} className="mr-1.5" /> My Products
          </Link>
          <Link
            to="/orders"
            className={`nav-link ${isActive("/orders") ? "active" : ""}`}
          >
            <Package size={15} className="mr-1.5" /> Orders
          </Link>
          <Link
            to="/wishlist"
            className={`nav-link ${isActive("/wishlist") ? "active" : ""}`}
          >
            <BookHeart size={15} className="mr-1.5" /> Wishlist
          </Link>
          {info.isAdmin && (
            <Link
              to="/admin"
              className={`nav-link ${isActive("/admin") ? "active" : ""}`}
            >
              <LayoutDashboard size={15} className="mr-1.5" /> Admin
            </Link>
          )}
        </div>

        {/* Search bar */}
        <div className="flex-1 mx-8 min-w-0 max-w-md hidden xl:flex">
          <div className="flex items-center w-full gap-2">
            <div className="relative flex-1" style={{ minWidth: '10rem' }}>
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search items, brands..."
                className="field pr-3 h-10 text-sm w-full truncate"
                style={{ borderRadius: "var(--radius-lg)", paddingLeft: "3rem" }}
              />
            </div>
            <select
              value={category}
              onChange={(e) => {
                const newCategory = e.target.value;
                setCategory(newCategory);
                if (search.trim()) {
                  navigate(`/items?search=${encodeURIComponent(search.trim())}&category=${encodeURIComponent(newCategory)}`);
                } else {
                  navigate(`/items?category=${encodeURIComponent(newCategory)}`);
                }
              }}
              className="field h-10 text-sm flex-shrink-0 cursor-pointer"
              style={{ borderRadius: "var(--radius-lg)", width: "10rem"}}
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-icon"
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Notifications */}
          <Link
            to="/notifications"
            className="btn btn-ghost btn-icon relative"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadNotifs > 0 && (
              <span className="notif-badge">
                {unreadNotifs > 9 ? "9+" : unreadNotifs}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="btn btn-ghost btn-icon relative"
            title="Cart"
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span
                className="notif-badge"
                style={{ background: "var(--brand)" }}
              >
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>

          {/* Profile */}
          <Link
            to={`/profile/${info.userId}`}
            className="hidden md:flex btn btn-ghost btn-icon"
            title="Profile"
          >
            {info.avatar ? (
              <img
                src={info.avatar}
                alt="avatar"
                className="w-7 h-7 rounded-full object-cover border-2 border-[var(--brand)]"
              />
            ) : (
              <User size={18} />
            )}
          </Link>

          {/* Sell button */}
          <Link
            to="/seller"
            className="hidden md:flex btn btn-accent btn-sm gap-1 ml-1"
          >
            <Tag size={14} /> Sell
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="hidden md:flex btn btn-ghost btn-icon"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* ── CATEGORY BAR (Amazon-style second row) ─────────────────────── */}
      <div style={{ background: "var(--bg-nav)", borderBottom: "1px solid var(--border)", borderTop: "none" }}>
        <div style={{ display: "flex", alignItems: "center", overflowX: "auto", padding: "0 1rem", scrollbarWidth: "none" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              style={{
                flexShrink: 0,
                padding: "0.6rem 1.1rem",
                fontSize: "0.8rem",
                fontWeight: 500,
                whiteSpace: "nowrap",
                color: activeCategory === cat ? "var(--brand)" : "var(--text-secondary)",
                background: "transparent",
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
                borderBottom: activeCategory === cat ? "2px solid var(--brand)" : "2px solid transparent",
                cursor: "pointer",
                marginRight: "0.25rem",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden animate-slideDown fixed top-[var(--navbar-h)] left-0 right-0 z-50 glass-nav border-t border-[var(--border)] p-4 space-y-2 shadow-xl">
          {/* Mobile search */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search..."
              className="field flex-1 h-9 text-sm"
            />
            <button
              onClick={handleSearch}
              className="btn btn-primary btn-sm h-9"
            >
              <Search size={14} />
            </button>
          </div>

          <Link to="/home" className="nav-link w-full">
            <Home size={15} /> Home
          </Link>
          <Link to="/my-products" className="nav-link w-full">
            <Store size={15} /> My Products
          </Link>
          <Link to="/orders" className="nav-link w-full">
            <Package size={15} /> Orders
          </Link>
          <Link to="/wishlist" className="nav-link w-full">
            <BookHeart size={15} /> Wishlist
          </Link>
          <Link to="/notifications" className="nav-link w-full justify-between">
            <span className="flex items-center gap-2">
              <Bell size={15} /> Notifications
            </span>
            {unreadNotifs > 0 && (
              <span className="badge badge-danger">{unreadNotifs}</span>
            )}
          </Link>
          <Link to={`/profile/${info.userId}`} className="nav-link w-full">
            <User size={15} /> Profile
          </Link>
          <Link to="/seller" className="btn btn-accent w-full">
            <Tag size={15} /> Sell an Item
          </Link>
          {info.isAdmin && (
            <Link to="/admin" className="nav-link w-full">
              <LayoutDashboard size={15} /> Admin
            </Link>
          )}
          <div className="divider" />
          <button onClick={handleLogout} className="btn btn-danger w-full">
            <LogOut size={15} /> Logout
          </button>
        </div>
      )}
    </>
  );
}
