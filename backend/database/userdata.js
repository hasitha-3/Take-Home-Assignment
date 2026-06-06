import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true, trim: true },
    lastname: { type: String, required: true, trim: true },
    Email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    contact_number: { type: String, required: true, unique: true },
    age: { type: Number, required: true, min: 1, max: 120 },
    password: { type: String, required: true, select: false },

    // Profile enrichment
    avatar: { type: String, default: "" }, // Cloudinary URL
    avatarPublicId: { type: String, default: "" },
    bio: { type: String, default: "", maxLength: 300 },
    address: { type: String, default: "" }, // City / location
    city: { type: String, default: "" },

    // Ratings (as a seller)
    sellerRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },

    // Status
    isActive: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: false },

    // Timestamps
  },
  { timestamps: true },
);

// Virtual: full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstname} ${this.lastname}`;
});

const User = mongoose.model("User", userSchema);
export default User;
