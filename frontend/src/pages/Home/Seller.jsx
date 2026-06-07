import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, Tag, Plus, Info, Camera, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import Navbar from "../Home/Navbar";
import api from "../../api";

const CATEGORIES = [
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
const CONDITIONS = ["Brand New", "Like New", "Good", "Fair", "Poor"];

// Category-specific field suggestions
const CATEGORY_SUGGESTIONS = {
  Electronics: {
    specKeys: [
      "Battery Life",
      "Connectivity",
      "RAM",
      "Storage",
      "Screen Size",
      "Processor",
      "Color",
    ],
    tagSuggestions: ["wireless", "portable", "fast charging", "brand new box"],
  },
  Books: {
    specKeys: ["Edition", "Publisher", "Pages", "Authors", "Year"],
    tagSuggestions: ["textbook", "gate prep", "notes inside", "good condition"],
  },
  Clothing: {
    specKeys: ["Size", "Material", "Color", "Fit", "Gender"],
    tagSuggestions: ["casual", "formal", "branded", "size M", "unisex"],
  },
  Fitness: {
    specKeys: ["Weight", "Material", "Size", "Type", "Brand"],
    tagSuggestions: ["gym", "outdoor", "light weight", "adjustable"],
  },
  default: {
    specKeys: ["Key 1", "Key 2", "Key 3"],
    tagSuggestions: [],
  },
};

function ImageUploadBox({ files, onChange }) {
  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/"),
    );
    onChange((prev) => [...prev, ...dropped].slice(0, 5));
  };

  return (
    <div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-[var(--border)] rounded-2xl p-8 text-center hover:border-[var(--brand)] transition-colors cursor-pointer"
        onClick={() => document.getElementById("imageInput").click()}
      >
        <Camera size={32} className="mx-auto mb-2 text-[var(--text-muted)]" />
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          Drop images here or{" "}
          <span className="text-[var(--brand)]">click to upload</span>
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Up to 5 images, 5MB each. PNG, JPG, WEBP
        </p>
        <input
          id="imageInput"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) =>
            onChange((prev) =>
              [...prev, ...Array.from(e.target.files)].slice(0, 5),
            )
          }
        />
      </div>

      {files.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {files.map((f, i) => (
            <div
              key={i}
              className="relative w-20 h-20 rounded-xl overflow-hidden border border-[var(--border)]"
            >
              <img
                src={URL.createObjectURL(f)}
                alt=""
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  onChange((prev) => prev.filter((_, j) => j !== i))
                }
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white"
              >
                <X size={10} />
              </button>
              {i === 0 && (
                <span className="absolute bottom-0.5 left-0.5 text-[9px] bg-black/60 text-white px-1 rounded">
                  Main
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Seller() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    itemname: "",
    itemprice: "",
    itemcategory: CATEGORIES[0],
    itemdescription: "",
    brand: "",
    condition: "Good",
    usageDuration: "",
    location: "",
    stock: "1",
    tags: [],
    specifications: [{ key: "", value: "" }],
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const suggestions =
    CATEGORY_SUGGESTIONS[form.itemcategory] || CATEGORY_SUGGESTIONS.default;

  const addTag = (tag) => {
    const t = (tag || tagInput).trim();
    if (!t || form.tags.includes(t) || form.tags.length >= 10) return;
    setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    setTagInput("");
  };

  const removeTag = (t) =>
    setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }));

  const updateSpec = (i, k, v) => {
    setForm((f) => {
      const specs = [...f.specifications];
      specs[i] = { ...specs[i], [k]: v };
      return { ...f, specifications: specs };
    });
  };

  const addSpec = () =>
    setForm((f) => ({
      ...f,
      specifications: [...f.specifications, { key: "", value: "" }],
    }));
  const removeSpec = (i) =>
    setForm((f) => ({
      ...f,
      specifications: f.specifications.filter((_, j) => j !== i),
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.itemname.trim()) {
      toast.error("Item name is required");
      return;
    }
    if (!form.itemprice || parseFloat(form.itemprice) < 0) {
      toast.error("Enter a valid price");
      return;
    }
    if (!form.itemdescription.trim()) {
      toast.error("Description is required");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("itemname", form.itemname.trim());
      fd.append("itemprice", form.itemprice);
      fd.append("itemcategory", form.itemcategory);
      fd.append("itemdescription", form.itemdescription.trim());
      fd.append("brand", form.brand);
      fd.append("condition", form.condition);
      fd.append("usageDuration", form.usageDuration);
      fd.append("location", form.location);
      fd.append("stock", form.stock);
      fd.append("tags", JSON.stringify(form.tags));
      fd.append(
        "specifications",
        JSON.stringify(form.specifications.filter((s) => s.key && s.value)),
      );
      images.forEach((img) => fd.append("images", img));

      await api.post("/sell", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Item listed successfully!");
      navigate("/my-products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to list item");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="page-container py-6 max-w-3xl">
        <div className="mb-6">
          <h1 className="hero-title text-3xl text-[var(--text-primary)]">
            List an Item for Sale
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Fill in the details below and post your product.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ── Images ─────────────────────────────────────────────────── */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h2 className="font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <Camera size={16} /> Photos
            </h2>
            <ImageUploadBox files={images} onChange={setImages} />
          </div>

          {/* ── Basic Info ──────────────────────────────────────────────── */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h2 className="font-bold text-[var(--text-primary)] mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="field-group mb-0 sm:col-span-2">
                <label className="field-label">Item Title *</label>
                <input
                  className="field"
                  placeholder="e.g., Sony WH-1000XM4 Wireless Headphones"
                  value={form.itemname}
                  onChange={set("itemname")}
                  required
                />
              </div>

              <div className="field-group mb-0">
                <label className="field-label">Category *</label>
                <select
                  className="field"
                  value={form.itemcategory}
                  onChange={set("itemcategory")}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="field-group mb-0">
                <label className="field-label">Brand</label>
                <input
                  className="field"
                  placeholder="e.g., Sony, Apple, Decathlon"
                  value={form.brand}
                  onChange={set("brand")}
                />
              </div>

              <div className="field-group mb-0">
                <label className="field-label">Condition *</label>
                <select
                  className="field"
                  value={form.condition}
                  onChange={set("condition")}
                >
                  {CONDITIONS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="field-group mb-0">
                <label className="field-label">Usage Duration</label>
                <input
                  className="field"
                  placeholder="e.g., 6 months, 2 years, Unused"
                  value={form.usageDuration}
                  onChange={set("usageDuration")}
                />
              </div>

              <div className="field-group mb-0">
                <label className="field-label">Price (₹) *</label>
                <input
                  type="number"
                  className="field"
                  placeholder="0"
                  min={0}
                  value={form.itemprice}
                  onChange={set("itemprice")}
                  required
                />
              </div>

              <div className="field-group mb-0">
                <label className="field-label">Stock / Quantity</label>
                <input
                  type="number"
                  className="field"
                  min={1}
                  value={form.stock}
                  onChange={set("stock")}
                />
              </div>

              <div className="field-group mb-0 sm:col-span-2">
                <label className="field-label">Location</label>
                <input
                  className="field"
                  placeholder="e.g., 123 Main St, New York"
                  value={form.location}
                  onChange={set("location")}
                />
              </div>

              <div className="field-group mb-0 sm:col-span-2">
                <label className="field-label">
                  Description *{" "}
                  <span className="text-[var(--text-muted)] normal-case font-normal">
                    (Be detailed — mention defects, accessories, etc.)
                  </span>
                </label>
                <textarea
                  className="field"
                  rows={5}
                  placeholder="Describe the item in detail..."
                  value={form.itemdescription}
                  onChange={set("itemdescription")}
                  required
                />
              </div>
            </div>
          </div>

          {/* ── Tags ────────────────────────────────────────────────────── */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h2 className="font-bold text-[var(--text-primary)] mb-3">
              Tags (max 10)
            </h2>

            {suggestions.tagSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                  <Info size={11} /> Suggestions:
                </span>
                {suggestions.tagSuggestions.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => addTag(t)}
                    className="badge badge-gray hover:badge-brand cursor-pointer transition-colors"
                  >
                    + {t}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2 mb-2">
              <input
                className="field flex-1"
                placeholder="Type a tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => addTag()}
                className="btn btn-secondary btn-sm"
              >
                Add
              </button>
            </div>

            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.tags.map((t) => (
                  <span key={t} className="badge badge-brand gap-1">
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="hover:text-red-400"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Specifications ───────────────────────────────────────────── */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-[var(--text-primary)]">
                Specifications
              </h2>
              <button
                type="button"
                onClick={addSpec}
                className="btn btn-ghost btn-sm gap-1"
              >
                <Plus size={14} /> Add Row
              </button>
            </div>

            <div className="space-y-2">
              {form.specifications.map((spec, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className="field flex-1"
                    placeholder={suggestions.specKeys[i] || `Key ${i + 1}`}
                    value={spec.key}
                    onChange={(e) => updateSpec(i, "key", e.target.value)}
                  />
                  <input
                    className="field flex-1"
                    placeholder={`Value`}
                    value={spec.value}
                    onChange={(e) => updateSpec(i, "value", e.target.value)}
                  />
                  {form.specifications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSpec(i)}
                      className="btn btn-ghost btn-icon text-[var(--danger)]"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-lg w-full"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Uploading & Publishing...
              </span>
            ) : (
              <>
                <Tag size={18} /> Publish Product <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
