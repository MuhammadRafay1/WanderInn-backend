const express = require("express");
const { getHostEarnings } = require("../controllers/hostController");
const { getHostProperties } = require("../controllers/listingController");
const { protect, host } = require("../middlewares/authMiddlewares");

const router = express.Router();

router.get("/earnings", protect, host, getHostEarnings);
router.get("/properties", protect, host, getHostProperties);
module.exports = router;