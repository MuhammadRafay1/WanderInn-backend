const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Session expired, please login again" });
      } else if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token, authentication failed" });
      } else {
        return res.status(401).json({ message: "Authorization error" });
      }
    }
  } else {
    res.status(401).json({ message: "Not authorized, token missing" });
  }
};

// Middleware for Admin users
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied, admin only" });
  }
};

module.exports = { protect, admin };
