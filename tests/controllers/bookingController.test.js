const bookingController = require("../../controllers/bookingController");
const Booking = require("../../models/booking");
const Listing = require("../../models/listings");
const User = require("../../models/User");
const sendEmail = require("../../utils/sendEmail");

jest.mock("../../models/booking");
jest.mock("../../models/listings");
jest.mock("../../models/User");
jest.mock("../../utils/sendEmail");

describe("bookingController", () => {
  describe("createBooking", () => {
    it("should return an error if property is not found", async () => {
      const req = {
        body: {
          property: "invalidPropertyId",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      Listing.findById.mockResolvedValue(null);

      await bookingController.createBooking(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Property not found.",
      });
    });

    it("should return an error if booking creation fails", async () => {
      const req = {
        body: {
          property: "propertyId",
          checkIn: "2025-05-01",
          checkOut: "2025-05-05",
          guests: 2,
          totalPrice: 500,
        },
        user: { id: "userId" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      Listing.findById.mockResolvedValue({ id: "propertyId", host: "hostId" });
      User.findById.mockResolvedValue({ id: "hostId", email: "host@example.com" });
      Booking.create.mockRejectedValue(new Error("Booking creation failed"));

      await bookingController.createBooking(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to create booking",
      });
    });
  });

  describe("createBooking", () => {
    it("should return an error if required fields are missing", async () => {
      const req = {
        body: {
          property: "propertyId",
          checkIn: "2025-05-01",
          // Missing checkOut, guests, totalPrice, and paymentMethod
        },
        user: { id: "userId" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await bookingController.createBooking(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "All fields are required.",
      });
    });
  });

  describe("getAllBookings", () => {
    it("should return all bookings for admin", async () => {
      const req = {
        user: { role: "admin" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      Booking.find.mockResolvedValue([
        { id: "booking1", property: "property1", user: "user1" },
        { id: "booking2", property: "property2", user: "user2" },
      ]);

      await bookingController.getAllBookings(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        { id: "booking1", property: "property1", user: "user1" },
        { id: "booking2", property: "property2", user: "user2" },
      ]);
    });
  });

  describe("getAllBookings", () => {
    it("should return an error if no bookings are found", async () => {
      const req = {
        user: { role: "admin" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      Booking.find.mockResolvedValue([]);
  
      await bookingController.getAllBookings(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "No bookings found.",
      });
    });
  });

  describe("getUserBookings", () => {
    it("should return an error if no bookings are found for the user", async () => {
      const req = {
        params: { userId: "userId" },
        user: { id: "userId", role: "user" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      Booking.find.mockResolvedValue([]);
  
      await bookingController.getUserBookings(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "No bookings found for this user.",
      });
    });
  });

  describe("updateBookingStatus", () => {
    it("should update the booking status successfully", async () => {
      const req = {
        params: { id: "bookingId" },
        body: { status: "completed" },
        user: { role: "admin" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      Booking.findByIdAndUpdate.mockResolvedValue({
        id: "bookingId",
        status: "completed",
      });
  
      await bookingController.updateBookingStatus(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Booking status updated successfully",
        booking: { id: "bookingId", status: "completed" },
      });
    });
  
    it("should return an error if booking is not found", async () => {
      const req = {
        params: { id: "invalidBookingId" },
        body: { status: "completed" },
        user: { role: "admin" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      Booking.findByIdAndUpdate.mockResolvedValue(null);
  
      await bookingController.updateBookingStatus(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Booking not found",
      });
    });
  });

  describe("deleteBooking", () => {
    it("should delete a booking successfully", async () => {
      const req = {
        params: { id: "bookingId" },
        user: { id: "userId", role: "admin" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      Booking.findById.mockResolvedValue({
        id: "bookingId",
        user: "userId",
      });
  
      await bookingController.deleteBooking(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Booking deleted successfully",
      });
    });
  
    it("should return an error if booking is not found", async () => {
      const req = {
        params: { id: "invalidBookingId" },
        user: { id: "userId", role: "admin" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      Booking.findById.mockResolvedValue(null);
  
      await bookingController.deleteBooking(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Booking not found",
      });
    });
  });

  describe("getPastBookings", () => {
    it("should return past bookings for the user", async () => {
      const req = {
        user: { id: "userId" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      Booking.find.mockResolvedValue([
        { id: "booking1", checkOut: "2025-04-01" },
      ]);
  
      await bookingController.getPastBookings(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        pastBookings: [{ id: "booking1", checkOut: "2025-04-01" }],
      });
    });
  
    it("should return an error if no past bookings are found", async () => {
      const req = {
        user: { id: "userId" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      Booking.find.mockResolvedValue([]);
  
      await bookingController.getPastBookings(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "No past bookings found.",
      });
    });
  });

  describe("rebookProperty", () => {
    it("should rebook a property successfully", async () => {
      const req = {
        body: {
          propertyId: "propertyId",
          checkIn: "2025-05-01",
          checkOut: "2025-05-05",
          guests: 2,
          paymentMethod: "Credit Card",
        },
        user: { id: "userId" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      Listing.findById.mockResolvedValue({ id: "propertyId", price: 100 });
      Booking.create.mockResolvedValue({
        id: "bookingId",
        property: "propertyId",
        user: "userId",
        checkIn: "2025-05-01",
        checkOut: "2025-05-05",
        guests: 2,
        totalPrice: 200,
        paymentMethod: "Credit Card",
      });
  
      await bookingController.rebookProperty(req, res);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Property rebooked successfully!",
        booking: {
          id: "bookingId",
          property: "propertyId",
          user: "userId",
          checkIn: "2025-05-01",
          checkOut: "2025-05-05",
          guests: 2,
          totalPrice: 200,
          paymentMethod: "Credit Card",
        },
      });
    });
  });

  describe("getAllBookings", () => {
    it("should return all bookings for admin", async () => {
      const req = {
        user: { role: "admin" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      Booking.find.mockResolvedValue([
        { id: "booking1", property: "property1", user: "user1" },
        { id: "booking2", property: "property2", user: "user2" },
      ]);

      await bookingController.getAllBookings(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        { id: "booking1", property: "property1", user: "user1" },
        { id: "booking2", property: "property2", user: "user2" },
      ]);
    });
  });
  

  describe("getUserBookings", () => {
    it("should return bookings for a specific user", async () => {
      const req = {
        params: { userId: "userId" },
        user: { id: "userId", role: "user" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      Booking.find.mockResolvedValue([
        { id: "booking1", property: "property1", user: "userId" },
      ]);

      await bookingController.getUserBookings(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        { id: "booking1", property: "property1", user: "userId" },
      ]);
    });

    it("should return an error if unauthorized access", async () => {
      const req = {
        params: { userId: "anotherUserId" },
        user: { id: "userId", role: "user" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await bookingController.getUserBookings(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Unauthorized access",
      });
    });
  });

  describe("getBookingById", () => {
    it("should return a booking by ID", async () => {
      const req = {
        params: { id: "bookingId" },
        user: { id: "userId", role: "user" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      Booking.findById.mockResolvedValue({
        id: "bookingId",
        property: "propertyId",
        user: { id: "userId" },
      });

      await bookingController.getBookingById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        id: "bookingId",
        property: "propertyId",
        user: { id: "userId" },
      });
    });

    it("should return an error if booking not found", async () => {
      const req = {
        params: { id: "invalidBookingId" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      Booking.findById.mockResolvedValue(null);

      await bookingController.getBookingById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Booking not found",
      });
    });
  });
});