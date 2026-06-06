import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Filter,
  SlidersHorizontal,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Navbar from "../Home/Navbar";
import ItemLayout from "./Item_layout";
import api from "../../api";

const CATEGORIES = [
  "All",
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
];
const CONDITIONS = ["Any", "Brand New", "Like New", "Good", "Fair", "Poor"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Viewed" },
];

function SkeletonCard() {
  return (
    <div className="skeleton w-full rounded-2xl" style={{ height: 340 }} />
  );
}

export default function ItemsShow() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [category, setCategory] = useState(
    searchParams.get("category") || "All",
  );
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [condition, setCondition] = useState(
    searchParams.get("condition") || "Any",
  );
  const [page, setPage] = useState(1);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setItems([]);
    try {
      const params = new URLSearchParams();
      if (category && category !== "All") params.set("category", category);
      if (search.trim()) params.set("search", search.trim());
      if (sort) params.set("sort", sort);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (condition && condition !== "Any") params.set("condition", condition);
      params.set("page", page);
      params.set("limit", 12);

      const res = await api.get(`/items?${params.toString()}`);
      setItems(res.data.items || []);
      setPagination(res.data.pagination || { total: 0, page: 1, pages: 1 });

      // Sync URL
      setSearchParams(Object.fromEntries(params));
    } catch (err) {
      console.error("Fetch items error:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [category, search, sort, minPrice, maxPrice, condition, page]);

  // Sync from URL on mount
  useEffect(() => {
    const cat = searchParams.get("category");
    const srch = searchParams.get("search");
    if (cat && cat !== category) setCategory(cat);
    if (srch && srch !== search) setSearch(srch);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [category, sort, condition, page]);

  const handleSearch = (e) => {
    e?.preventDefault();
    setPage(1);
    fetchItems();
  };

  const clearFilters = () => {
    setCategory("All");
    setSearch("");
    setSort("newest");
    setMinPrice("");
    setMaxPrice("");
    setCondition("Any");
    setPage(1);
  };

  const hasActiveFilters =
    category !== "All" || search || minPrice || maxPrice || condition !== "Any";

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="page-container py-6">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="hero-title text-3xl text-[var(--text-primary)]">
              {category !== "All" ? category : "All Listings"}
              {search && ` · "${search}"`}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              {loading ? "Loading..." : `${pagination.total} items found`}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary gap-2"
          >
            <SlidersHorizontal size={16} />
            Filters
            {hasActiveFilters && (
              <span className="badge badge-brand ml-1">•</span>
            )}
          </button>
        </div>

        {/* ── Filter Panel ───────────────────────────────────────────────── */}
        {showFilters && (
          <div className="glass-card p-5 mb-6 animate-slideDown">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div className="field-group mb-0">
                <label className="field-label">Search</label>
                <form onSubmit={handleSearch} className="flex gap-1">
                  <input
                    className="field flex-1"
                    placeholder="Item name, brand..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary btn-sm">
                    <Search size={14} />
                  </button>
                </form>
              </div>

              {/* Category */}
              <div className="field-group mb-0">
                <label className="field-label">Category</label>
                <select
                  className="field"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Condition */}
              <div className="field-group mb-0">
                <label className="field-label">Condition</label>
                <select
                  className="field"
                  value={condition}
                  onChange={(e) => {
                    setCondition(e.target.value);
                    setPage(1);
                  }}
                >
                  {CONDITIONS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="field-group mb-0">
                <label className="field-label">Sort By</label>
                <select
                  className="field"
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price range */}
            <div className="flex flex-wrap gap-3 items-end">
              <div className="field-group mb-0">
                <label className="field-label">Min Price (₹)</label>
                <input
                  type="number"
                  className="field w-32"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  min={0}
                />
              </div>
              <div className="field-group mb-0">
                <label className="field-label">Max Price (₹)</label>
                <input
                  type="number"
                  className="field w-32"
                  placeholder="∞"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  min={0}
                />
              </div>
              <button
                onClick={() => {
                  setPage(1);
                  fetchItems();
                }}
                className="btn btn-primary"
              >
                Apply Filters
              </button>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn btn-ghost gap-1">
                  <X size={14} /> Clear All
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Category chips ──────────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setPage(1);
              }}
              className={`btn btn-sm flex-shrink-0 ${category === cat ? "btn-primary" : "btn-secondary"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Items Grid ─────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array(12)
              .fill(0)
              .map((_, i) => (
                <SkeletonCard key={i} />
              ))}
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">🔍</span>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              No items found
            </h3>
            <p className="text-[var(--text-secondary)]">
              Try adjusting your filters or search term
            </p>
            <button onClick={clearFilters} className="btn btn-primary mt-2">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {items.map((item) => (
              <ItemLayout key={item._id} item_info={item} />
            ))}
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-secondary btn-icon"
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 || p === pagination.pages || Math.abs(p - page) <= 2,
              )
              .map((p, i, arr) => (
                <React.Fragment key={p}>
                  {i > 0 && arr[i - 1] !== p - 1 && (
                    <span className="text-[var(--text-muted)]">…</span>
                  )}
                  <button
                    onClick={() => setPage(p)}
                    className={`btn btn-sm ${p === page ? "btn-primary" : "btn-secondary"}`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              ))}

            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="btn btn-secondary btn-icon"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
