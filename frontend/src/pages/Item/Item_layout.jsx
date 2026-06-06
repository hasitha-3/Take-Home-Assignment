import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Star,
  MapPin,
  Eye,
  Zap,
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
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../api";
import { useAppContext } from "../../MyContext";
import {
  CATEGORY_DEFAULT_IMAGES,
  getImageUrl,
} from "../../utils/categoryImages";

const CONDITION_COLORS = {
  "Brand New": { cls: "cond-new", bg: "badge-success" },
  "Like New": { cls: "cond-like-new", bg: "badge-brand" },
  Good: { cls: "cond-good", bg: "badge-gray" },
  Fair: { cls: "cond-fair", bg: "badge-warning" },
  Poor: { cls: "cond-poor", bg: "badge-danger" },
};

const CATEGORY_ICONS = {
  Electronics: Laptop,
  Books: Book,
  Clothing: Shirt,
  Fitness: Dumbbell,
  Stationery: PenTool,
  Food: Coffee,
  Gaming: Gamepad2,
  "Home & Living": HomeIcon,
  Sports: Medal,
  "Beauty & Care": Sparkles,
};

export default function ItemLayout({ item_info, onWishlistChange }) {
  const { info, refreshCartCount } = useAppContext();
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(item_info.isWishlisted || false);
  const [addingCart, setAddingCart] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!item_info) return null;

  const {
    _id,
    itemname,
    itemcategory,
    itemdescription,
    itemprice,
    brand,
    condition,
    images,
    seller_id,
    stock,
    views,
    location,
    usageDuration,
    wishlistCount,
  } = item_info;

  const isOwnItem = seller_id?._id === info.userId || seller_id === info.userId;
  const condStyle = CONDITION_COLORS[condition] || CONDITION_COLORS["Good"];
  const imgSrc = getImageUrl(images, itemcategory);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (isOwnItem) {
      toast.error("You cannot buy your own item!");
      return;
    }
    if (stock <= 0) {
      toast.error("Out of stock");
      return;
    }

    setAddingCart(true);
    try {
      await api.post("/cart/add", { item_info, quantity: 1 });
      toast.success(`${itemname} added to cart!`);
      refreshCartCount();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingCart(false);
    }
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    try {
      const res = await api.post(`/wishlist/toggle/${_id}`);
      setWishlisted(res.data.wishlisted);
      toast(
        res.data.wishlisted ? "Added to wishlist" : "Removed from wishlist",
        {
          style: { background: "var(--surface)", color: "var(--text-primary)" },
        },
      );
      onWishlistChange?.();
    } catch (err) {
      toast.error("Could not update wishlist");
    }
  };

  const handleCardClick = () => navigate(`/items/${_id}`);

  return (
    <div className="item-card group" onClick={handleCardClick}>
      {/* Image area */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: "4/3", background: "var(--surface-2)" }}
      >
        <img
          src={imgSrc}
          alt={itemname}
          className="item-card-image transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = CATEGORY_DEFAULT_IMAGES[itemcategory] || CATEGORY_DEFAULT_IMAGES.default;
          }}
        />

        {/* Overlay badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {stock <= 0 && (
            <span className="badge badge-danger">Out of Stock</span>
          )}
          {condition && (
            <span className={`badge ${condStyle.bg} text-xs`}>{condition}</span>
          )}
          {isOwnItem && <span className="badge badge-brand">Your Listing</span>}
        </div>

        {/* Wishlist btn */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow hover:scale-110 transition-all"
        >
          <Heart
            size={15}
            className={
              wishlisted ? "fill-red-500 stroke-red-500" : "stroke-gray-600"
            }
          />
        </button>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <span className="text-white text-xs flex items-center gap-1">
            <Eye size={12} /> {views || 0} views
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="item-card-body">
        {/* Category + Brand */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-[var(--text-muted)] font-medium">
            {itemcategory}
          </span>
          {brand && (
            <span className="text-xs font-semibold text-[var(--brand)]">
              {brand}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-[var(--text-primary)] text-sm leading-snug mb-1 line-clamp-2 capitalize">
          {itemname}
        </h3>

        {/* Description */}
        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-2 leading-relaxed">
          {itemdescription}
        </p>

        {/* Location + Usage */}
        {(location || usageDuration) && (
          <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mb-2">
            {location && (
              <span className="flex items-center gap-0.5">
                <MapPin size={10} /> {location.split(",")[0]}
              </span>
            )}
            {usageDuration && usageDuration !== "Unused" && (
              <span className="flex items-center gap-0.5">
                <Zap size={10} /> Used {usageDuration}
              </span>
            )}
          </div>
        )}

        {/* Seller */}
        {seller_id?.firstname && (
          <p className="text-xs text-[var(--text-muted)] mb-2 flex items-center gap-1">
            {seller_id.isOnline && <span className="online-dot" />}
            {seller_id.firstname} {seller_id.lastname}
          </p>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-2">
          <div>
            <p className="font-bold text-xl text-[var(--brand)]">
              ₹{itemprice.toLocaleString("en-IN")}
            </p>
            {stock > 0 && stock <= 3 && (
              <p className="text-xs text-orange-500 font-medium">
                Only {stock} left!
              </p>
            )}
          </div>

          {isOwnItem ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/my-listings");
              }}
              className="btn btn-secondary btn-sm"
            >
              Manage
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={stock <= 0 || addingCart}
              className="btn btn-primary btn-sm"
            >
              {addingCart ? (
                <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
              ) : stock <= 0 ? (
                "Sold Out"
              ) : (
                <>
                  <ShoppingCart size={14} /> Add
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
