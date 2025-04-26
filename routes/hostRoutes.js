const express = require("express");
const {getHostEarnings, getNotifications, markNotificationAsRead } = require("../controllers/hostController");
const { getHostProperties } = require("../controllers/listingController");
const { protect, host } = require("../middlewares/authMiddlewares");

const router = express.Router();

router.get("/earnings", protect, host, getHostEarnings);
router.get("/properties", protect, host, getHostProperties);
router.get("/notifications", protect, host, getNotifications);
router.patch("/notifications/:notificationId", protect, host, markNotificationAsRead);

module.exports = router;