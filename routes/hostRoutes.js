const express = require("express");
const { getHostEarnings } = require("../controllers/hostController");
const { protect, host } = require("../middlewares/authMiddlewares");

const router = express.Router();


router.get("/earnings", protect, host, getHostEarnings);

module.exports = router;