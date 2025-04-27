const { protect } = require("../../middlewares/authMiddlewares");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const { admin } = require("../../middlewares/authMiddlewares");
const { host } = require("../../middlewares/authMiddlewares");
jest.mock("jsonwebtoken");
jest.mock("../../models/User");

describe("authMiddlewares", () => {
  describe("protect", () => {
    it("should allow access if token is valid", async () => {
      const req = {
        headers: {
          authorization: "Bearer mockToken",
        },
      };
      const res = {};
      const next = jest.fn();

      jwt.verify.mockReturnValue({ id: "12345" });
      User.findById.mockResolvedValue({ id: "12345", name: "John Doe" });

      await protect(req, res, next);

      expect(req.user).toEqual({ id: "12345", name: "John Doe" });
      expect(next).toHaveBeenCalled();
    });

    it("should return an error if token is missing", async () => {
      const req = {
        headers: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Not authorized, token missing",
      });
    });

    it("should return an error if token is expired", async () => {
      const req = {
        headers: {
          authorization: "Bearer expiredToken",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      jwt.verify.mockImplementation(() => {
        const error = new Error("Token expired");
        error.name = "TokenExpiredError";
        throw error;
      });

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Session expired, please login again",
      });
    });

    it("should return an error if token is invalid", async () => {
      const req = {
        headers: {
          authorization: "Bearer invalidToken",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      jwt.verify.mockImplementation(() => {
        const error = new Error("Invalid token");
        error.name = "JsonWebTokenError";
        throw error;
      });

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid token, authentication failed",
      });
    });

    it("should return an error if user is not found", async () => {
      const req = {
        headers: {
          authorization: "Bearer mockToken",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      jwt.verify.mockReturnValue({ id: "12345" });
      User.findById.mockResolvedValue(null);

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not found",
      });
    });
  });

  describe("admin middleware", () => {
    it("should allow access if user is an admin", () => {
      const req = {
        user: { role: "admin" },
      };
      const res = {};
      const next = jest.fn();
  
      admin(req, res, next);
  
      expect(next).toHaveBeenCalled();
    });
  
    it("should return an error if user is not an admin", () => {
      const req = {
        user: { role: "user" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();
  
      admin(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Access denied, admin only",
      });
    });
  });

  describe("host middleware", () => {
    it("should allow access if user is a host", () => {
      const req = {
        user: { role: "host" },
      };
      const res = {};
      const next = jest.fn();
  
      host(req, res, next);
  
      expect(next).toHaveBeenCalled();
    });
  
    it("should return an error if user is not a host", () => {
      const req = {
        user: { role: "user" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();
  
      host(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Access denied, host only",
      });
    });
  });

  describe("protect middleware", () => {
    it("should return an error if JWT verification fails with an unknown error", async () => {
      const req = {
        headers: {
          authorization: "Bearer invalidToken",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();
  
      jwt.verify.mockImplementation(() => {
        throw new Error("Unknown error");
      });
  
      await protect(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Authorization error",
      });
    });
  });
});