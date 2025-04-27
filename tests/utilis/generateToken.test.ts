const generateToken = require("../../utils/generateToken");
const jwt = require("jsonwebtoken");

describe("generateToken", () => {
    it("should generate a valid JWT token", () => {
      const userId = "12345";
      jwt.sign.mockReturnValue("mockToken");
  
      const token = generateToken(userId);
  
      expect(jwt.sign).toHaveBeenCalledWith({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });
      expect(token).toBe("mockToken");
    });
  
    it("should throw an error if JWT_SECRET is missing", () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
  
      expect(() => generateToken("12345")).toThrow();
  
      process.env.JWT_SECRET = originalSecret; // Restore the secret
    });
  });