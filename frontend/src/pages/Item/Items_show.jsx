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

  // Sync URL to UI state whenever URL changes
  useEffect(() => {
    setCategory(searchParams.get("category") || "All");
    setSearch(searchParams.get("search") || "");
    setSort(searchParams.get("sort") || "newest");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setCondition(searchParams.get("condition") || "Any");
    setPage(parseInt(searchParams.get("page")) || 1);
  }, [searchParams]);

  // Fetch data whenever URL changes
  useEffect(() => {
    const fetchFromURL = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(searchParams);
        if (!params.has("page")) params.set("page", 1);
        params.set("limit", 12);
        
        const res = await api.get(`/items?${params.toString()}`);
        setItems(res.data.items || []);
        setPagination(res.data.pagination || { total: 0, page: 1, pages: 1 });
      } catch (err) {
        console.error("Fetch items error:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFromURL();
  }, [searchParams]);

  const handleSearch = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (category && category !== "All") params.set("category", category);
    if (search.trim()) params.set("search", search.trim());
    if (sort && sort !== "newest") params.set("sort", sort);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (condition && condition !== "Any") params.set("condition", condition);
    params.set("page", 1);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setCategory("All");
    setSearch("");
    setSort("newest");
    setMinPrice("");
    setMaxPrice("");
    setCondition("Any");
    setPage(1);
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    setSearchParams(params);
  };

  const hasActiveFilters =
    category !== "All" || search || minPrice || maxPrice || condition !== "Any";

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="page-container py-8">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="hero-title text-3xl md:text-4xl text-[var(--text-primary)]">
              {category !== "All" ? category : "All Products"}
              {search && ` · "${search}"`}
            </h1>
            <p className="text-base text-[var(--text-secondary)] mt-1">
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
          <div className="glass-card mb-6 animate-slideDown" style={{ padding: '1.5rem' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div className="field-group mb-0">
                <label className="field-label" style={{ marginBottom: '1.5rem' }}>Search</label>
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
                <label className="field-label" style={{ marginBottom: '1.5rem' }}>Category</label>
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
                <label className="field-label" style={{ marginBottom: '1.5rem' }}>Condition</label>
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
                <label className="field-label" style={{ marginBottom: '1.5rem' }}>Sort By</label>
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

            <div className="divider my-4" />

            {/* Price range */}
            <div className="flex flex-wrap gap-3 items-end">
              <div className="field-group mb-0">
                <label className="field-label" style={{ marginBottom: '1.5rem' }}>Price Range (₹)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="field w-32"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    min={0}
                  />
                  <span className="text-[var(--text-muted)]">–</span>
                  <input
                    type="number"
                    className="field w-32"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    min={0}
                  />
                </div>
              </div>
              <button
                onClick={handleSearch}
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


        {/* ── Items Grid ─────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemLayout key={item._id} item_info={item} />
            ))}
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => handlePageChange(Math.max(1, page - 1))}
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
                    onClick={() => handlePageChange(p)}
                    className={`btn btn-sm ${p === page ? "btn-primary" : "btn-secondary"}`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              ))}

            <button
              onClick={() => handlePageChange(Math.min(pagination.pages, page + 1))}
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
