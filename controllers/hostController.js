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

const getNotifications = async (req, res) => {
  try {
    const host = await User.findById(req.user.id).select("notifications");

    if (!host) {
      return res.status(404).json({ error: "Host not found." });
    }

    res.status(200).json({ notifications: host.notifications });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications", details: error.message });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const host = await User.findById(req.user.id);
    if (!host) {
      return res.status(404).json({ error: "Host not found." });
    }

    const notification = host.notifications.id(notificationId);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found." });
    }

    notification.isRead = true;
    await host.save();

    res.status(200).json({ message: "Notification marked as read." });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark notification as read", details: error.message });
  }
};

module.exports = {getHostEarnings, getNotifications, markNotificationAsRead };
