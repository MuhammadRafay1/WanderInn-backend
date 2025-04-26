const Booking = require("../models/booking");
const Listing = require("../models/listings");
const User = require("../models/User");

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (User only)
const createBooking = async (req, res) => {
    try {
        const { property, checkIn, checkOut, guests, totalPrice, paymentMethod, specialRequests } = req.body;
        const userId = req.user.id; // User making the booking

        // Validate required fields
        if (!property || !checkIn || !checkOut || !guests || !totalPrice || !paymentMethod) {
            return res.status(400).json({ error: "All fields are required." });
        }

        // Check if the property exists
        const listing = await Listing.findById(property).populate("host");
        if (!listing) {
            return res.status(404).json({ error: "Property not found." });
        }
        const cancellationPolicy = listing.cancellationPolicy;

        // Create new booking
        const newBooking = new Booking({
            property,
            user: userId,
            checkIn,
            checkOut,
            guests,
            totalPrice,
            paymentMethod,
            specialRequests
        });

        await newBooking.save();
        res.status(201).json({ message: "Booking created successfully!", booking: newBooking, cancellationPolicy });
    } catch (error) {
        res.status(500).json({ error: "Failed to create booking", details: error.message });
    }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings
// @access  Private (Admin only)
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("property", "title location")
            .populate("user", "name email");

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve bookings", details: error.message });
    }
};

// @desc    Get bookings for a specific user
// @route   GET /api/bookings/user/:userId
// @access  Private (User only)
const getUserBookings = async (req, res) => {
    try {
        const { userId } = req.params;

        if (req.user.id !== userId && req.user.role !== "admin") {
            return res.status(403).json({ error: "Unauthorized access" });
        }

        const bookings = await Booking.find({ user: userId })
            .populate("property", "title location")
            .sort({ createdAt: -1 });

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve bookings", details: error.message });
    }
};

// @desc    Get a single booking by ID
// @route   GET /api/bookings/:id
// @access  Private (User/Admin)
const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate("property", "title location")
            .populate("user", "name email");

        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        // Ensure only the booking owner or admin can access the booking
        if (req.user.id !== booking.user.id && req.user.role !== "admin") {
            return res.status(403).json({ error: "Unauthorized access" });
        }

        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve booking", details: error.message });
    }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id
// @access  Private (Admin only)
const updateBookingStatus = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Only admins can update booking status" });
        }

        const { status } = req.body;
        const validStatuses = ["confirmed", "completed", "cancelled"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status value" });
        }

        const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });

        if (!updatedBooking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        res.status(200).json({ message: "Booking status updated successfully", booking: updatedBooking });
    } catch (error) {
        res.status(500).json({ error: "Failed to update booking status", details: error.message });
    }
};

// @desc    Delete a booking
// @route   DELETE /api/bookings/:id
// @access  Private (Admin or User who made the booking)
const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        // Allow admin or the user who created the booking to delete it
        if (req.user.id !== booking.user.toString() && req.user.role !== "admin") {
            return res.status(403).json({ error: "Unauthorized to delete this booking" });
        }

        await Booking.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete booking", details: error.message });
    }
};

const getPastBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch past bookings where the check-out date is in the past
    const pastBookings = await Booking.find({
      user: userId,
      checkOut: { $lt: new Date() }, // Check-out date is in the past
    })
      .populate("property", "title location price images") // Populate property details
      .sort({ checkOut: -1 }); // Sort by most recent check-out date

    if (pastBookings.length === 0) {
      return res.status(404).json({ message: "No past bookings found." });
    }

    res.status(200).json({ pastBookings });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch past bookings", details: error.message });
  }
};

const rebookProperty = async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut, guests, paymentMethod } = req.body;

    // Validate required fields
    if (!propertyId || !checkIn || !checkOut || !guests || !paymentMethod) {
      return res.status(400).json({ error: "All fields are required for rebooking." });
    }

    // Check if the property exists
    const property = await Listing.findById(propertyId);
    if (!property) {
      return res.status(404).json({ error: "Property not found." });
    }

    // Create a new booking
    const newBooking = new Booking({
      property: propertyId,
      user: req.user.id,
      checkIn,
      checkOut,
      guests,
      totalPrice: property.price * guests, // Calculate total price
      paymentMethod,
    });

    await newBooking.save();
    res.status(201).json({ message: "Property rebooked successfully!", booking: newBooking });
  } catch (error) {
    res.status(500).json({ error: "Failed to rebook property", details: error.message });
  }
};

module.exports = {
    createBooking,
    getAllBookings,
    getUserBookings,
    getBookingById,
    updateBookingStatus,
    deleteBooking,
    getPastBookings,
    rebookProperty
};
