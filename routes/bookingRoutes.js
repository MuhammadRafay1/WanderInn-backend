const express = require("express");
const router = express.Router();
const {
    getPastBookings,
    createBooking,
    getAllBookings,
    getUserBookings,
    getBookingById,
    updateBookingStatus,
    deleteBooking,

    rebookProperty
} = require("../controllers/bookingController");

const { protect, admin } = require("../middlewares/authMiddlewares");


router.post("/", protect, createBooking);

router.get("/", protect, admin, getAllBookings);
router.get("/user/:userId", protect, getUserBookings);


router.patch("/:id", protect, admin, updateBookingStatus);

router.delete("/:id", protect, deleteBooking);

// Route to fetch past bookings
router.get("/past", protect, getPastBookings);

// Route to rebook a property
router.post("/rebook", protect, rebookProperty);
router.get("/:id", protect, getBookingById);
module.exports = router;
