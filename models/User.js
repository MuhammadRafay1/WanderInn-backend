const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");


const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["user", "host" , "admin"],
      default: "user"
    },
    status: {
      type: String,
      enum: ["active", "inactive","suspended"],
      default: "active"
    },
    properties: {
      type: Number,
      default: 0
    },
    bookings: {
      type: Number,
      default: 0
    },
    notifications: [
      {
        message: { type: String, required: true },
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
        isRead: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);



UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
  //debuged
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
