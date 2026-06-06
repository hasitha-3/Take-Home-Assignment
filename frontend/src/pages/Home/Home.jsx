import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  TrendingUp,
  Zap,
  ShieldCheck,
  Tag,
  Laptop,
  Book,
  Shirt,
  Dumbbell,
  PenTool,
  Coffee,
  Gamepad2,
  Home as HomeIcon,
  Medal,
  Sparkles,
  PackageOpen,
  Globe,
} from "lucide-react";
import Navbar from "./Navbar";
import ItemLayout from "../Item/Item_layout";
import { useAppContext } from "../../MyContext";
import api from "../../api";

const CATEGORIES = [
  {
    name: "Electronics",
    icon: <Laptop size={24} />,
    color: "from-blue-500 to-indigo-600",
  },
  {
    name: "Books",
    icon: <Book size={24} />,
    color: "from-emerald-500 to-teal-600",
  },
  {
    name: "Clothing",
    icon: <Shirt size={24} />,
    color: "from-pink-500 to-rose-600",
  },
  {
    name: "Fitness",
    icon: <Dumbbell size={24} />,
    color: "from-orange-500 to-amber-600",
  },
  {
    name: "Stationery",
    icon: <PenTool size={24} />,
    color: "from-violet-500 to-purple-600",
  },
  {
    name: "Food",
    icon: <Coffee size={24} />,
    color: "from-lime-500 to-green-600",
  },
  {
    name: "Gaming",
    icon: <Gamepad2 size={24} />,
    color: "from-cyan-500 to-sky-600",
  },
  {
    name: "Home & Living",
    icon: <HomeIcon size={24} />,
    color: "from-yellow-500 to-orange-600",
  },
  {
    name: "Sports",
    icon: <Medal size={24} />,
    color: "from-red-500 to-rose-600",
  },
  {
    name: "Beauty & Care",
    icon: <Sparkles size={24} />,
    color: "from-fuchsia-500 to-pink-600",
  },
];

const FEATURES = [
  {
    icon: <ShieldCheck size={28} />,
    title: "Verified Sellers",
    desc: "All sellers are verified",
  },
  {
    icon: <Zap size={28} />,
    title: "Instant Listings",
    desc: "List your item in under 2 minutes",
  },
  {
    icon: <TrendingUp size={28} />,
    title: "Best Prices",
    desc: "Competitive deals every day",
  },
];

function SkeletonCard() {
  return <div className="skeleton w-64 h-80 rounded-2xl" />;
}

export default function Home() {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { info } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/items?limit=8&sort=newest");
        setFeaturedItems(res.data.items || []);
      } catch (err) {
        console.error("Error fetching items:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="page-container py-12 md:py-20">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          {/* Left */}
          <div className="flex-1 animate-fadeIn">
            <p className="badge badge-brand mb-4 flex items-center gap-1">
              <Globe size={14} /> Global Marketplace
            </p>
            <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl mb-5">
              Buy & Sell
              <br />
              <span className="gradient-text">Like a Pro</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-lg max-w-lg leading-relaxed mb-8">
              The smartest way to buy, sell, and discover amazing deals from
              people around the world. From textbooks to gadgets — everything in
              one place.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/items" className="btn btn-primary btn-lg">
                Browse Marketplace <ArrowRight size={18} />
              </Link>
              <Link to="/seller" className="btn btn-secondary btn-lg">
                <Tag size={18} /> Start Selling
              </Link>
            </div>

            {/* Quick stats */}
            <div className="flex gap-8 mt-10">
              {[
                ["500+", "Items Listed"],
                ["200+", "Happy Sellers"],
                ["1000+", "Transactions"],
              ].map(([n, l]) => (
                <div key={l}>
                  <p className="hero-title text-2xl gradient-text">{n}</p>
                  <p className="text-sm text-[var(--text-muted)]">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — decorative card stack */}
          <div className="hidden lg:block flex-shrink-0 animate-float">
            <div className="relative w-72 h-72">
              <div className="glass-card absolute inset-0 rounded-3xl rotate-6 opacity-60" />
              <div className="glass-card absolute inset-0 rounded-3xl rotate-3 opacity-80" />
              <div className="glass-card absolute inset-0 rounded-3xl flex flex-col items-center justify-center p-8 text-center">
                <span className="mb-3 text-[var(--brand)]">
                  <PackageOpen size={48} />
                </span>
                <p className="hero-title text-2xl gradient-text">BuySell</p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Global Marketplace
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE HIGHLIGHTS ─────────────────────────────────────────────── */}
      <section className="page-container pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`glass-card p-6 animate-fadeIn stagger-${i + 1}`}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                style={{
                  background:
                    "linear-gradient(135deg, var(--brand), var(--brand-dark))",
                  color: "#fff",
                }}
              >
                {f.icon}
              </div>
              <p className="font-bold text-[var(--text-primary)] mb-1">
                {f.title}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ─────────────────────────────────────────────────────── */}
      <section className="page-container pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="hero-title text-3xl text-[var(--text-primary)]">
            Shop by Category
          </h2>
          <Link to="/items" className="btn btn-ghost btn-sm">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat.name}
              onClick={() => navigate(`/items?category=${cat.name}`)}
              className={`glass-card p-5 text-center transition-all duration-200 hover:scale-105 hover:shadow-xl animate-fadeIn stagger-${Math.min(i + 1, 5)}`}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mx-auto mb-3 text-2xl shadow-md`}
              >
                {cat.icon}
              </div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {cat.name}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* ── FEATURED ITEMS ─────────────────────────────────────────────────── */}
      <section className="page-container pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="hero-title text-3xl text-[var(--text-primary)]">
            Latest Listings
          </h2>
          <Link to="/items" className="btn btn-ghost btn-sm">
            See All →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <SkeletonCard key={i} />
              ))}
          </div>
        ) : featuredItems.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">
              <PackageOpen size={64} />
            </span>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              No items yet
            </h3>
            <p className="text-[var(--text-secondary)]">
              Be the first to list something!
            </p>
            <Link to="/seller" className="btn btn-primary mt-2">
              List an Item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featuredItems.map((item, i) => (
              <div
                key={item._id}
                className={`animate-fadeIn stagger-${Math.min(i + 1, 5)}`}
              >
                <ItemLayout item_info={item} />
              </div>
            ))}
          </div>
        )}

        {!loading && featuredItems.length > 0 && (
          <div className="text-center mt-10">
            <Link to="/items" className="btn btn-primary btn-lg">
              Browse All Listings <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
