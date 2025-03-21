const express = require("express");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { protect } = require("../middlewares/authMiddlewares");
const router = express.Router();
const { isAdmin } = require("../middlewares/roleMiddlewares");


// Register User
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await User.create({ name, email, password });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id),
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
});

// Login User
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id),
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
});


// Assign admin role (only admin can do this)
router.put("/makeadmin/:id", protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.role = "admin";
    await user.save();
    res.json({ message: "User is now an admin" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Protected admin route
router.get("/adminonly", protect, isAdmin, (req, res) => {
  res.json({ message: "Welcome, Admin!" });
});

module.exports = router;
