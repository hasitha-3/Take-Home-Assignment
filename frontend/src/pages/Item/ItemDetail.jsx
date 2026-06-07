import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  Share2,
  MapPin,
  Star,
  Eye,
  Tag,
  Package,
  Phone,
  Mail,
  Calendar,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Navbar from "../Home/Navbar";
import api from "../../api";
import { CATEGORY_DEFAULT_IMAGES } from "../../utils/categoryImages";
import { useAppContext } from "../../MyContext";
import { getMultipleImageUrls } from "../../utils/categoryImages";

const CONDITION_MAP = {
  "Brand New": { color: "var(--success)", bg: "rgba(16,185,129,0.1)" },
  "Like New": { color: "var(--brand)", bg: "rgba(99,102,241,0.1)" },
  Good: { color: "var(--info)", bg: "rgba(59,130,246,0.1)" },
  Fair: { color: "var(--warning)", bg: "rgba(245,158,11,0.1)" },
  Poor: { color: "var(--danger)", bg: "rgba(239,68,68,0.1)" },
};

function StarRating({ rating }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={
            s <= Math.round(rating) ? "text-amber-400" : "text-gray-300"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function ItemDetail() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { info, refreshCartCount } = useAppContext();

  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    const fetch = async () => {
      try {
        const [itemRes, reviewRes, wishRes] = await Promise.all([
          api.get(`/items/${itemId}`),
          api.get(`/reviews/item/${itemId}`),
          info.userId
            ? api.get(`/wishlist/check/${itemId}`)
            : Promise.resolve({ data: { wishlisted: false } }),
        ]);
        setItem(itemRes.data);
        setReviews(reviewRes.data.reviews || []);
        setAvgRating(reviewRes.data.avgRating || 0);
        setWishlisted(wishRes.data.wishlisted);
      } catch (err) {
        toast.error("Item not found");
        navigate("/items");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [itemId]);

  const handleAddToCart = async () => {
    if (item.stock <= 0) {
      toast.error("Out of stock");
      return;
    }
    if (!item.isAvailable) {
      toast.error("The item is unavailable");
      return;
    }
    if (isOwnItem) {
      toast.error("You cannot buy your own item!");
      return;
    }
    setAdding(true);
    try {
      await api.post("/cart/add", { item_info: item, quantity });
      toast.success(`Added ${quantity}x ${item.itemname} to cart`);
      refreshCartCount();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async () => {
    try {
      const res = await api.post(`/wishlist/toggle/${itemId}`);
      setWishlisted(res.data.wishlisted);
      toast(res.data.wishlisted ? "Added to wishlist" : "Removed from wishlist");
    } catch {
      toast.error("Could not update wishlist");
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="page-container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="skeleton aspect-square rounded-2xl" />
            <div className="space-y-4">
              {[80, 50, 60, 40, 100].map((w, i) => (
                <div
                  key={i}
                  className="skeleton h-6 rounded"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) return null;

  const isOwnItem =
    item.seller_id?._id === info.userId || item.seller_id === info.userId;
  const cond = CONDITION_MAP[item.condition] || CONDITION_MAP["Good"];
  const imgs = getMultipleImageUrls(item.images, item.itemcategory);
  const seller = item.seller_id || {};

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="page-container py-6">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm mb-5 gap-1"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* ── Images ─────────────────────────────────────────────────── */}
          <div>
            <div className={`relative rounded-2xl overflow-hidden aspect-square bg-[var(--surface-2)] mb-3 ${(!item.isAvailable || item.stock <= 0) ? 'opacity-60 grayscale' : ''}`}>
                <img
                  src={imgs[imgIdx]}
                  alt={item.itemname}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = CATEGORY_DEFAULT_IMAGES[item.itemcategory] || CATEGORY_DEFAULT_IMAGES.default;
                  }}
                />

              {/* Prev/Next */}
              {imgs.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setImgIdx((i) => (i - 1 + imgs.length) % imgs.length)
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setImgIdx((i) => (i + 1) % imgs.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {imgs.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {imgs.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${imgIdx === i ? "border-[var(--brand)]" : "border-[var(--border)]"}`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = CATEGORY_DEFAULT_IMAGES[item.itemcategory] || CATEGORY_DEFAULT_IMAGES.default;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Details ─────────────────────────────────────────────────── */}
          <div className="animate-fadeIn">
            {/* Category + Condition */}
            <div className="flex items-center gap-2 mb-3">
              <span className="badge badge-gray">{item.itemcategory}</span>
              <span
                className="badge"
                style={{ background: cond.bg, color: cond.color }}
              >
                {item.condition}
              </span>
              {!item.isAvailable ? (
                <span className="badge badge-warning">Unavailable</span>
              ) : item.stock <= 0 ? (
                <span className="badge badge-danger">Sold</span>
              ) : (
                <span className="badge badge-success">In Stock</span>
              )}
            </div>

            {/* Title */}
            <h1 className="hero-title text-3xl text-[var(--text-primary)] mb-1 capitalize">
              {item.itemname}
            </h1>

            {/* Brand */}
            {item.brand && (
              <p className="text-sm text-[var(--text-muted)] mb-3">
                Brand:{" "}
                <span className="font-semibold text-[var(--brand)]">
                  {item.brand}
                </span>
              </p>
            )}

            {/* Rating */}
            {avgRating > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <StarRating rating={avgRating} />
                <span className="text-sm font-semibold">{avgRating}</span>
                <span className="text-sm text-[var(--text-muted)]">
                  ({reviews.length} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mb-5">
              <p className="hero-title text-4xl text-[var(--brand)]">
                ₹{item.itemprice.toLocaleString("en-IN")}
              </p>
            </div>

            {/* Quantity + CTA */}
            {!isOwnItem && item.isAvailable && item.stock > 0 && (
              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--surface)]">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    style={{ width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    className="hover:bg-[var(--surface-2)] transition-colors text-lg font-medium"
                  >
                    −
                  </button>
                  <span className="font-semibold text-center border-x border-[var(--border)]" style={{ minWidth: '3rem', padding: '0.5rem 0' }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(item.stock, q + 1))
                    }
                    style={{ width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    className="hover:bg-[var(--surface-2)] transition-colors text-lg font-medium"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm font-medium text-[var(--text-muted)]">
                  {item.stock} available
                </span>
              </div>
            )}

            <div className="flex gap-3 flex-wrap">
              {isOwnItem ? (
                <button
                  onClick={() => navigate("/my-products")}
                  className="btn btn-secondary btn-lg flex-1"
                >
                  <Tag size={18} /> Manage Product
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={!item.isAvailable || item.stock <= 0 || adding}
                  className="btn btn-primary btn-lg flex-1 gap-2"
                >
                  {adding ? (
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart size={20} />{" "}
                      {item.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                    </>
                  )}
                </button>
              )}

              <button
                onClick={handleWishlist}
                className={`btn btn-icon btn-lg ${wishlisted ? "btn-danger" : "btn-secondary"}`}
              >
                <Heart size={20} className={wishlisted ? "fill-current" : ""} />
              </button>
              <button
                onClick={handleShare}
                className="btn btn-secondary btn-icon btn-lg"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Tabs (Full Width) ─────────────────────────────────────────────── */}
        <div style={{ marginTop: '4rem' }}>
          {/* Tab Navigation */}
          <div className="flex border-b border-[var(--border)] gap-12" style={{ marginBottom: '3rem' }}>
            {["details", "specifications", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-semibold tracking-wide uppercase transition-colors relative ${
                  activeTab === tab
                    ? "text-[var(--brand)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--brand)] rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="animate-fadeIn">
            {activeTab === "details" && (
              <div className="max-w-4xl" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-secondary)] uppercase tracking-wide" style={{ marginBottom: '1.5rem' }}>
                    Description
                  </h3>
                  <p className="text-[var(--text-primary)] text-sm leading-relaxed whitespace-pre-wrap">
                    {item.itemdescription}
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-[var(--text-secondary)] uppercase tracking-wide" style={{ marginBottom: '1.5rem' }}>
                    Key Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {item.usageDuration && (
                      <div className="glass-card flex items-center gap-4" style={{ padding: '1.5rem', gap: '1.25rem' }}>
                        <div className="p-2 bg-[var(--surface-2)] rounded-lg text-[var(--brand)]">
                          <Zap size={18} />
                        </div>
                        <div>
                          <p className="text-xs text-[var(--text-muted)]">
                            Usage
                          </p>
                          <p className="text-sm font-semibold">
                            {item.usageDuration}
                          </p>
                        </div>
                      </div>
                    )}
                    {item.location && (
                      <div className="glass-card flex items-center gap-4" style={{ padding: '1.5rem', gap: '1.25rem' }}>
                        <div className="p-2 bg-[var(--surface-2)] rounded-lg text-[var(--brand)]">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <p className="text-xs text-[var(--text-muted)]">
                            Location
                          </p>
                          <p className="text-sm font-semibold">
                            {item.location}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="glass-card flex items-center gap-4" style={{ padding: '1.5rem', gap: '1.25rem' }}>
                      <div className="p-2 bg-[var(--surface-2)] rounded-lg text-[var(--brand)]">
                        <Eye size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-[var(--text-muted)]">
                          Views
                        </p>
                        <p className="text-sm font-semibold">{item.views}</p>
                      </div>
                    </div>
                    <div className="glass-card flex items-center gap-4" style={{ padding: '1.5rem', gap: '1.25rem' }}>
                      <div className="p-2 bg-[var(--surface-2)] rounded-lg text-[var(--brand)]">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-[var(--text-muted)]">
                          Listed On
                        </p>
                        <p className="text-sm font-semibold">
                          {new Date(item.createdAt).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="flex flex-col max-w-4xl" style={{ gap: '3rem' }}>
                {item.specifications?.length > 0 ? (
                  <div>
                    <h3 className="font-bold text-sm text-[var(--text-secondary)] uppercase tracking-wide" style={{ marginBottom: '1.5rem' }}>
                      Technical Specifications
                    </h3>
                    <div className="glass-card overflow-hidden rounded-xl">
                      {item.specifications.map((spec, i) => (
                        <div
                          key={i}
                          className={`flex text-sm ${i % 2 === 0 ? "bg-[var(--surface-2)]/50" : ""}`}
                          style={{ padding: '1rem 1.5rem' }}
                        >
                          <span className="w-1/3 text-[var(--text-muted)] font-medium">
                            {spec.key}
                          </span>
                          <span className="w-2/3 text-[var(--text-primary)] font-semibold">
                            {spec.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-[var(--text-muted)]">
                    <Package size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No specifications provided</p>
                  </div>
                )}

                {/* Seller Info */}
                {seller.firstname && (
                  <div>
                    <h3 className="font-bold text-sm text-[var(--text-secondary)] uppercase tracking-wide" style={{ marginBottom: '1.5rem' }}>
                      Seller Information
                    </h3>
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                      <div className="flex items-start gap-4">
                        {seller.avatar ? (
                          <img
                            src={seller.avatar}
                            alt="seller"
                            className="w-12 h-12 rounded-full object-cover border-2 border-[var(--brand)]"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl">
                            {seller.firstname[0]}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-[var(--text-primary)]">
                              {seller.firstname} {seller.lastname}
                            </p>
                            {seller.isOnline && (
                              <span className="badge badge-success">
                                Online
                              </span>
                            )}
                          </div>
                          {seller.sellerRating > 0 && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <StarRating rating={seller.sellerRating} />
                              <span className="text-xs text-[var(--text-muted)]">
                                {seller.sellerRating.toFixed(1)} rating
                              </span>
                            </div>
                          )}
                          {seller.address && (
                            <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1 mt-1">
                              <MapPin size={12} /> {seller.address}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-3 mt-2 text-sm text-[var(--text-secondary)]">
                            {seller.Email && (
                              <a
                                href={`mailto:${seller.Email}`}
                                className="flex items-center gap-1 hover:text-[var(--brand)]"
                              >
                                <Mail size={13} /> {seller.Email}
                              </a>
                            )}
                            {seller.contact_number && (
                              <span className="flex items-center gap-1">
                                <Phone size={13} /> {seller.contact_number}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="max-w-4xl">
                {reviews.length > 0 ? (
                  <>
                    <div className="flex items-center gap-3" style={{ marginBottom: '2.5rem' }}>
                      <h3 className="hero-title text-2xl text-[var(--text-primary)]">
                        Reviews
                      </h3>
                      <div className="badge badge-gray flex items-center gap-1 px-3 py-1">
                        <Star
                          size={14}
                          className="fill-amber-400 text-amber-400"
                        />
                        <span className="font-bold text-sm">{avgRating}</span>
                        <span className="text-xs text-[var(--text-muted)] lowercase">
                          ({reviews.length})
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                      {reviews.map((r) => (
                        <div key={r._id} className="glass-card" style={{ padding: '1.5rem' }}>
                          <div className="flex items-center gap-3" style={{ marginBottom: '1.25rem' }}>
                            {r.buyer_id?.avatar ? (
                              <img
                                src={r.buyer_id.avatar}
                                className="w-10 h-10 rounded-full object-cover"
                                alt=""
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                                {r.buyer_id?.firstname?.[0] || "?"}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-sm">
                                {r.buyer_id?.firstname} {r.buyer_id?.lastname}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <StarRating rating={r.rating} />
                                <span className="text-xs text-[var(--text-muted)]">
                                  •{" "}
                                  {new Date(r.createdAt).toLocaleDateString(
                                    "en-IN",
                                  )}
                                </span>
                              </div>
                            </div>
                            {r.isVerifiedPurchase && (
                              <span className="badge badge-success ml-auto text-xs">
                                ✓ Verified
                              </span>
                            )}
                          </div>
                          {r.title && (
                            <p className="font-bold text-sm mb-1 text-[var(--text-primary)]">
                              {r.title}
                            </p>
                          )}
                          {r.comment && (
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                              {r.comment}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center bg-[var(--surface-2)] rounded-xl border border-[var(--border)] max-w-xl mx-auto" style={{ padding: '1.5rem 0' }}>
                    <Star
                      size={32}
                      className="text-[var(--text-muted)] opacity-50"
                      style={{ display: 'block', margin: '0 auto 0.5rem auto' }}
                    />
                    <h4 className="font-bold text-[var(--text-primary)]" style={{ marginBottom: '0.25rem' }}>
                      No reviews yet
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)]">
                      This item hasn't been reviewed.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
