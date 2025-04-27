const Booking = require("../../models/booking");

describe("Booking Model", () => {
  it("should generate a unique confirmation code before saving", async () => {
    const mockBooking = new Booking({
      property: "propertyId",
      user: "userId",
      checkIn: new Date("2025-05-01"),
      checkOut: new Date("2025-05-05"),
      guests: 2,
      totalPrice: 500,
      paymentMethod: "Credit Card",
    });

    await mockBooking.save();

    expect(mockBooking.confirmationCode).toMatch(/^STAY[A-Z0-9]{8}$/);
  });

  it("should not overwrite an existing confirmation code", async () => {
    const mockBooking = new Booking({
      property: "propertyId",
      user: "userId",
      checkIn: new Date("2025-05-01"),
      checkOut: new Date("2025-05-05"),
      guests: 2,
      totalPrice: 500,
      paymentMethod: "Credit Card",
      confirmationCode: "STAY12345678",
    });

    await mockBooking.save();

    expect(mockBooking.confirmationCode).toBe("STAY12345678");
  });
});