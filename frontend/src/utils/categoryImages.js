export const CATEGORY_DEFAULT_IMAGES = {
  Electronics: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
  Books: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
  Clothing: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80",
  Fitness: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
  Stationery: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&q=80",
  Food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
  Gaming: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80",
  "Home & Living": "https://images.unsplash.com/photo-1583847268964-b28ce8fce015?w=800&q=80",
  Sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
  "Beauty & Care": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
  default: "https://images.unsplash.com/photo-1513116476489-7635e79feb27?w=800&q=80",
};

export const getImageUrl = (images, category) => {
  if (typeof images === "string" && images) return images;
  if (images && images.length > 0 && images[0]?.url) {
    return images[0].url;
  }
  return CATEGORY_DEFAULT_IMAGES[category] || CATEGORY_DEFAULT_IMAGES.default;
};

export const getMultipleImageUrls = (images, category) => {
  if (images && images.length > 0) {
    return images.map(img => img.url || img); // Handle if it's already a string or object
  }
  return [CATEGORY_DEFAULT_IMAGES[category] || CATEGORY_DEFAULT_IMAGES.default];
};
