const express = require("express");
const { submitReview, fetchReviews } = require("../controllers/reviewController");
const { protect } = require("../middlewares/authMiddlewares");

const router = express.Router();

router.post("/", protect, submitReview);

// Route to fetch reviews for a property
router.get("/:propertyId", fetchReviews);

module.exports = router;

