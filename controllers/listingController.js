const Listing = require("../models/listings");
const express = require("express");

const router = express.Router();



const createListing = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized: No user found" });
        }

        const {
            title,
            description,
            location,
            price,
            rating,
            reviews,
            amenities,
            images,
            cancellationPolicy,
            bedrooms,
            bathrooms,
            maxGuests
        } = req.body;

        const newListing = new Listing({
            title,
            description,
            location,
            price,
            rating,
            reviews,
            amenities,
            images,
            cancellationPolicy,
            bedrooms,
            bathrooms,
            maxGuests,
            host: req.user.id // Automatically assign logged-in user as the host
        });

        const savedListing = await newListing.save();
        await savedListing.populate("host", "name email response responseTime image"); // Fetch host details

        res.status(201).json(savedListing);
    } catch (error) {
        res.status(500).json({ error: "Failed to create listing", details: error.message });
    }
};


const getListings = async (req, res) => {

    try {
      const { location, price, bedrooms, bathrooms, available } = req.query;
      let filter = {};
  
      if (location) {
        filter.location = { $regex: location, $options: "i" }; // Case-insensitive search
      }
      if (price) {
        filter.price = { $lte: parseInt(price) }; // Listings with price <= given value
      }
      if (bedrooms) {
        filter.bedrooms = parseInt(bedrooms);
      }
      if (bathrooms) {
        filter.bathrooms = parseInt(bathrooms);
      }
      if (available !== undefined) {
        filter.available = available === "true"; // Convert string to boolean
      }
  
      const listings = await Listing.find(filter);
      res.status(200).json(listings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};
  



const getListingById = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ error: "Listing not found" });
        }
        res.status(200).json(listing);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch listing" });
    }
};


const updateListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ error: "Listing not found" });
        }

        // Check if logged-in user is the owner of the listing
        if (listing.owner.toString() !== req.user.id) {
            return res.status(403).json({ error: "Not authorized" });
        }

        const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedListing);
    } catch (error) {
        res.status(500).json({ error: "Failed to update listing" });
    }
};


const deleteListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ error: "Listing not found" });
        }

        // Check if logged-in user is the owner
        if (listing.owner.toString() !== req.user.id) {
            return res.status(403).json({ error: "Not authorized" });
        }

        await listing.deleteOne();
        res.status(200).json({ message: "Listing deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete listing" });
    }
};

module.exports = { createListing, getListings, getListingById, updateListing, deleteListing };
