const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    guestName: {
      type: String,
      required: true,
    },
    guestEmail: {
      type: String,
      required: true,
    },
    issue: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["open", "in progress", "closed"],
      default: "open",
    },
    referenceNumber: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Generate a unique reference number before saving
supportTicketSchema.pre("save", function (next) {
  if (!this.referenceNumber) {
    this.referenceNumber = `TICKET-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  }
  next();
});

const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);
module.exports = SupportTicket;