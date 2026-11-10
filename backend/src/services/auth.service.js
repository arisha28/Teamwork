import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { config } from "../config/env.js";
import { BadRequestError, UnauthorizedError, ConflictError } from "../utils/AppError.js";

export const registerUser = async ({ name, email, password, role = "REGULAR_USER" }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ConflictError("A user with this email address already exists.");
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role
  });

  const token = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  return { user, token };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new UnauthorizedError("Invalid email or password.");
  }

  if (user.status === "disabled") {
    throw new UnauthorizedError("This account has been deactivated. Please contact an admin.");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid email or password.");
  }

  const token = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  return { user, token };
};
