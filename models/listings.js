const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true,
      index: true
    },
    price: {
      type: Number,
      required: true
    },
    rating: {
      type: Number,
      default: 0
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    amenities: {
      type: [String],
      default: []
    },
    images: {
      type: [String],
      default: []
    },
    cancellationPolicy: {
      type: String,
      required: true
    },
    bedrooms: {
      type: Number,
      required: true
    },
    bathrooms: {
      type: Number,
      required: true
    },
    maxGuests: {
      type: Number,
      required: true
    },
    available: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      trim: true,
    }
  },
  { timestamps: true }
);

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
