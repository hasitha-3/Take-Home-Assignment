import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Tag,
  PackageOpen,
} from "lucide-react";
import Navbar from "./Navbar";
import ItemLayout from "../Item/Item_layout";
import { useAppContext } from "../../MyContext";
import api from "../../api";


function SkeletonCard() {
  return <div className="skeleton w-full h-72 rounded-xl" />;
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
      <section className="page-container py-16 md:py-24">
        <div className="max-w-xl">
          <h1 className="hero-title text-4xl md:text-5xl mb-4">
            Buy &amp; Sell<br />
            <span className="gradient-text">Anything, Anytime</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-base leading-relaxed mb-8">
            A simple marketplace for students and individuals to buy and sell
            second-hand items.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/items" className="btn btn-primary btn-lg">
              Browse Items <ArrowRight size={18} />
            </Link>
            <Link to="/seller" className="btn btn-secondary btn-lg">
              <Tag size={18} /> Sell an Item
            </Link>
          </div>
        </div>
      </section>

      {/* ── LATEST LISTINGS ─────────────────────────────────────────────────── */}
      <section className="page-container pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Latest Products
          </h2>
          <Link to="/items" className="btn btn-ghost btn-sm text-[var(--brand)]">
            See All →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array(8).fill(0).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : featuredItems.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">
              <PackageOpen size={56} />
            </span>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" style={{ paddingBottom: '15px'}}>
            {featuredItems.map((item) => (
              <ItemLayout key={item._id} item_info={item} />
            ))}
          </div>
        )}

        {!loading && featuredItems.length > 0 && (
          <div className="text-center" style={{ paddingBottom: '15px' }}>
            <Link to="/items" className="btn btn-primary btn-lg">
              Browse All Products <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
