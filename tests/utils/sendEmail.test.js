const sendEmail = require("../../utils/sendEmail");
const nodemailer = require("nodemailer");

jest.mock("nodemailer");

describe("sendEmail", () => {
  let mockSendMail;

  beforeEach(() => {
    mockSendMail = jest.fn();
    nodemailer.createTransport.mockReturnValue({
      sendMail: mockSendMail,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should send an email successfully", async () => {
    mockSendMail.mockResolvedValue("Email sent");

    await sendEmail("test@example.com", "Test Subject", "Test Body");

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    expect(mockSendMail).toHaveBeenCalledWith({
      from: process.env.EMAIL_USER,
      to: "test@example.com",
      subject: "Test Subject",
      text: "Test Body",
    });
  });

  it("should log an error if email sending fails", async () => {
    const errorMessage = "Failed to send email";
    mockSendMail.mockRejectedValue(new Error(errorMessage));

    console.error = jest.fn();

    await sendEmail("test@example.com", "Test Subject", "Test Body");

    expect(console.error).toHaveBeenCalledWith(
      "Failed to send email:",
      errorMessage
    );
  });

  it("should throw an error if EMAIL_USER is missing", async () => {
    const originalEmailUser = process.env.EMAIL_USER;
    delete process.env.EMAIL_USER;

    await expect(
      sendEmail("test@example.com", "Test Subject", "Test Body")
    ).rejects.toThrow();

    process.env.EMAIL_USER = originalEmailUser; // Restore the original value
  });

  it("should throw an error if EMAIL_PASS is missing", async () => {
    const originalEmailPass = process.env.EMAIL_PASS;
    delete process.env.EMAIL_PASS;

    await expect(
      sendEmail("test@example.com", "Test Subject", "Test Body")
    ).rejects.toThrow();

    process.env.EMAIL_PASS = originalEmailPass; // Restore the original value
  });
});