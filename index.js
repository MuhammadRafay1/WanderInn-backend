require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const listingRoutes = require("./routes/listingRoutes"); 
const bookingRoutes = require("./routes/bookingRoutes")
const reviewRoutes = require("./routes/reviewRoutes");
const hostRoutes = require("./routes/hostRoutes");
const app = express();

// Middleware
app.use(express.json());
app.use(cors());


app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/bookings", bookingRoutes )
app.use("/api/reviews", reviewRoutes);
app.use("/api/hosts",hostRoutes);
// Connect Database
connectDB();

// Routes (Temporary)
app.get("/", (req, res) => {
  res.send("WanderInn API is running...");
});

// Server Listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
