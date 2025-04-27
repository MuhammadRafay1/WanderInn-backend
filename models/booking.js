const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    checkIn: {
      type: Date,
      required: true
    },
    checkOut: {
      type: Date,
      required: true
    },
    guests: {
      type: Number,
      required: true,
      min: 1
    },
    //checked
    status: {
      type: String,
      enum: ["confirmed", "completed", "cancelled"],
      default: "confirmed"
    },
    totalPrice: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ["Credit Card", "PayPal", "Bank Transfer", "Cash"],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending", "Failed"],
      default: "Pending"
    },
    bookingDate: {
      type: Date,
      default: Date.now
    },
    confirmationCode: {
      type: String,
      unique: true
    },
    specialRequests: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
  //works
);

// Generate unique confirmation code before saving
bookingSchema.pre("save", function (next) {
  if (!this.confirmationCode) {
    this.confirmationCode = `STAY${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  }
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
