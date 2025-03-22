const express = require("express");
const { 
    createListing, 
    getListings, 
    getListingById, 
    updateListing, 
    deleteListing 
} = require("../controllers/listingController");
const { protect } = require("../middlewares/authMiddlewares");

const router = express.Router();

// Public Routes
router.get("/", getListings); 
router.get("/:id", getListingById); 

// Private Routes witj authentication for logged In only
router.post("/", protect, createListing); 
router.put("/:id", protect, updateListing); 
router.delete("/:id", protect, deleteListing); 

module.exports = router;
