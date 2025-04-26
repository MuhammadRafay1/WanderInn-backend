const express = require("express");
const {
  submitSupportTicket,
  getGuestTickets,
  getAllSupportTickets,
  updateTicketStatus,
} = require("../controllers/supportController");
const { protect, admin } = require("../middlewares/authMiddlewares");

const router = express.Router();

// Guest routes
router.post("/tickets", protect, submitSupportTicket);
router.get("/tickets", getGuestTickets);

// Admin routes
router.get("/admin/tickets", protect, admin, getAllSupportTickets);
router.patch("/admin/tickets/:ticketId", protect, admin, updateTicketStatus);

module.exports = router;