const Review = require("../models/review");
const Booking = require("../models/booking");
const Listing = require("../models/listings");

const submitReview = async (req, res) => {
  try {
    const { propertyId, rating, comment } = req.body;

    // Validate required fields
    if (!propertyId || !rating || !comment) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Check if the user has completed a stay at the property
    const completedBooking = await Booking.findOne({
      property: propertyId,
      user: req.user.id,
      checkOut: { $lt: new Date() }, // Ensure the check-out date is in the past
    });

    if (!completedBooking) {
      return res.status(403).json({ error: "You can only review properties you have stayed at." });
    }

    // Create a new review
    const newReview = new Review({
      property: propertyId,
      user: req.user.id,
      rating,
      comment,
    });

    await newReview.save();

    // Add the review to the property
    const property = await Listing.findById(propertyId);
    property.reviews.push(newReview._id);
    await property.save();

    res.status(201).json({ message: "Review submitted successfully!", review: newReview });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit review", details: error.message });
  }
};

const fetchReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const reviews = await Review.find({ property: propertyId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews", details: error.message });
  }
};

module.exports = { submitReview, fetchReviews };