const User = require("../../models/User");
const bcrypt = require("bcryptjs");

jest.mock("bcryptjs");

describe("User Model", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should hash the password before saving", async () => {
    const mockUser = new User({
      name: "John Doe",
      email: "john@example.com",
      password: "Password123",
    });

    const salt = "mockSalt";
    const hashedPassword = "mockHashedPassword";

    bcrypt.genSalt.mockResolvedValue(salt);
    bcrypt.hash.mockResolvedValue(hashedPassword);

    await mockUser.save();

    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith("Password123", salt);
    expect(mockUser.password).toBe(hashedPassword);
  });

  it("should not hash the password if it is not modified", async () => {
    const mockUser = new User({
      name: "John Doe",
      email: "john@example.com",
      password: "Password123",
    });

    mockUser.isModified = jest.fn().mockReturnValue(false);

    await mockUser.save();

    expect(bcrypt.genSalt).not.toHaveBeenCalled();
    expect(bcrypt.hash).not.toHaveBeenCalled();
  });

  it("should match the password correctly", async () => {
    const mockUser = new User({
      password: "hashedPassword",
    });

    bcrypt.compare.mockResolvedValue(true);

    const isMatch = await mockUser.matchPassword("Password123");

    expect(bcrypt.compare).toHaveBeenCalledWith("Password123", "hashedPassword");
    expect(isMatch).toBe(true);
  });

  it("should return false if the password does not match", async () => {
    const mockUser = new User({
      password: "hashedPassword",
    });

    bcrypt.compare.mockResolvedValue(false);

    const isMatch = await mockUser.matchPassword("WrongPassword");

    expect(bcrypt.compare).toHaveBeenCalledWith("WrongPassword", "hashedPassword");
    expect(isMatch).toBe(false);
  });
});