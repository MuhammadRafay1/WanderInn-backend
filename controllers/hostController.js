const Booking = require("../models/booking");
const Listing = require("../models/listings");

const getHostEarnings = async (req, res) => {
  try {
    const hostId = req.user.id; // Host's ID from the authenticated user
    const { startDate, endDate } = req.query;

    // Fetch all properties owned by the host
    const properties = await Listing.find({ host: hostId }).select("_id");

    if (!properties.length) {
      return res.status(404).json({ message: "No properties found for this host." });
    }

    // Extract property IDs
    const propertyIds = properties.map((property) => property._id);

    // Build the query for bookings
    const query = {
      property: { $in: propertyIds },
      status: "completed", // Only include completed bookings
    };

    // Apply date filters if provided
    if (startDate) {
      query.checkOut = { $gte: new Date(startDate) };
    }
    if (endDate) {
      query.checkOut = query.checkOut
        ? { ...query.checkOut, $lte: new Date(endDate) }
        : { $lte: new Date(endDate) };
    }

    // Fetch bookings and calculate earnings
    const bookings = await Booking.find(query).select("totalPrice checkOut");

    const totalEarnings = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

    res.status(200).json({
      totalEarnings,
      bookings,
      filters: { startDate, endDate },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch earnings data", details: error.message });
  }
};

module.exports = { getHostEarnings };