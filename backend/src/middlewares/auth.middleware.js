import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { User } from "../models/User.js";
import { UnauthorizedError } from "../utils/AppError.js";

export const authenticate = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      throw new UnauthorizedError("Authentication token is missing. Please log in.");
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new UnauthorizedError("The user belonging to this token no longer exists.");
    }

    if (user.status === "disabled") {
      throw new UnauthorizedError("Your account has been disabled. Please contact administrator.");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Invalid or expired authentication token."));
    }
    next(error);
  }
};
