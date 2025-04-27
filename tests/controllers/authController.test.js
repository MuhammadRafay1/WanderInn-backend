const authController = require("../../controllers/authController");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

jest.mock("../../models/User");
jest.mock("jsonwebtoken");
jest.mock("bcryptjs");

describe("authController", () => {
  describe("registerUser", () => {
    it("should register a new user successfully", async () => {
      const req = {
        body: {
          name: "John Doe",
          email: "john@example.com",
          password: "Password123",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      User.create.mockResolvedValue({
        id: "12345",
        name: "John Doe",
        email: "john@example.com",
      });

      await authController.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: "12345",
        name: "John Doe",
        email: "john@example.com",
      });
    });

    it("should return an error if email is already in use", async () => {
      const req = {
        body: {
          name: "John Doe",
          email: "john@example.com",
          password: "Password123",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      User.create.mockRejectedValue(new Error("Email already exists"));

      await authController.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Email already exists",
      });
    });
  });

  describe("loginUser", () => {
    it("should log in a user successfully", async () => {
      const req = {
        body: {
          email: "john@example.com",
          password: "Password123",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockUser = {
        id: "12345",
        email: "john@example.com",
        password: "hashedPassword",
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("mockToken");

      await authController.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        token: "mockToken",
      });
    });

    it("should return an error if email or password is incorrect", async () => {
      const req = {
        body: {
          email: "john@example.com",
          password: "WrongPassword",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      User.findOne.mockResolvedValue(null);

      await authController.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid email or password",
      });
    });
  });
});