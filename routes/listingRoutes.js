const express = require("express");
const { 
    createListing, 
    getListings, 
    getListingById, 
    updateListing, 
    deleteListing,
    approveListing,
    rejectListing,
    filterPropertiesByAmenities,
    getTrendingDestinations
} = require("../controllers/listingController");
const { protect, admin } = require("../middlewares/authMiddlewares");

const router = express.Router();

// Public Routes
router.get("/trending", getTrendingDestinations);
router.get("/", getListings); 
router.get("/:id", getListingById); 

// Private Routes witj authentication for logged In only
router.post("/", protect, createListing); 
router.put("/:id", protect, updateListing); 
router.delete("/:id", protect, deleteListing); 

// Admin-only routes for moderating listings
router.patch("/:id/approve", protect, admin, approveListing);
router.patch("/:id/reject", protect, admin, rejectListing);

// Route for filtering properties by amenities
router.get("/filter", filterPropertiesByAmenities);

// Route to fetch trending destinations


module.exports = router;
