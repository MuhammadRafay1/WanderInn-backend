const express = require("express");
const router = express.Router();
const {
    createBooking,
    getAllBookings,
    getUserBookings,
    getBookingById,
    updateBookingStatus,
    deleteBooking
} = require("../controllers/bookingController");

const { protect, admin } = require("../middlewares/authMiddlewares");


router.post("/", protect, createBooking);

router.get("/", protect, admin, getAllBookings);
router.get("/user/:userId", protect, getUserBookings);

router.get("/:id", protect, getBookingById);
router.patch("/:id", protect, admin, updateBookingStatus);

router.delete("/:id", protect, deleteBooking);

module.exports = router;
