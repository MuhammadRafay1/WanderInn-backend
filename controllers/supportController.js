const SupportTicket = require("../models/supportTicket");

const submitSupportTicket = async (req, res) => {
    try {
      const { guestName, guestEmail, issue } = req.body;
  
      if (!guestName || !guestEmail || !issue) {
        return res.status(400).json({ error: "All fields are required." });
      }
  
      const newTicket = new SupportTicket({
        user: req.user.id, // Add the authenticated user's ID
        guestName,
        guestEmail,
        issue,
      });
  
      await newTicket.save();
  
      res.status(201).json({
        message: "Support ticket submitted successfully.",
        referenceNumber: newTicket.referenceNumber,
        ticket: newTicket,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit support ticket", details: error.message });
    }
  };

const getGuestTickets = async (req, res) => {
  try {
    const { guestEmail } = req.query;

    if (!guestEmail) {
      return res.status(400).json({ error: "Guest email is required to fetch tickets." });
    }

    const tickets = await SupportTicket.find({ guestEmail }).sort({ createdAt: -1 });

    if (!tickets.length) {
      return res.status(404).json({ message: "No support tickets found for this email." });
    }

    res.status(200).json({ tickets });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch support tickets", details: error.message });
  }
};

const getAllSupportTickets = async (req, res) => {
    try {
      const tickets = await SupportTicket.find().sort({ createdAt: -1 });
  
      res.status(200).json({ tickets });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch support tickets", details: error.message });
    }
};

const updateTicketStatus = async (req, res) => {
    try {
      const { ticketId } = req.params;
      const { status } = req.body;
  
      if (!["open", "in progress", "closed"].includes(status)) {
        return res.status(400).json({ error: "Invalid status value." });
      }
  
      const ticket = await SupportTicket.findById(ticketId);
  
      if (!ticket) {
        return res.status(404).json({ error: "Support ticket not found." });
      }
  
      ticket.status = status;
      await ticket.save();
  
      res.status(200).json({ message: "Ticket status updated successfully.", ticket });
    } catch (error) {
      res.status(500).json({ error: "Failed to update ticket status", details: error.message });
    }
};

module.exports = { submitSupportTicket, getGuestTickets, getAllSupportTickets, updateTicketStatus };