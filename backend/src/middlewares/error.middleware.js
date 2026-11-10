import { logger } from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || null;

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
    errors = Object.values(err.errors).map((e) => e.message);
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate value entered for ${field}. It must be unique.`;
  }

  // Mongoose invalid ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ID format for ${err.path}: ${err.value}`;
  }

  if (statusCode >= 500) {
    logger.error(`[Unhandled Error] ${req.method} ${req.url}: ${err.message}`, { stack: err.stack });
  } else {
    logger.warn(`[Client Error ${statusCode}] ${req.method} ${req.url}: ${message}`);
  }

  res.status(statusCode).json({
    status: `${statusCode}`.startsWith("4") ? "fail" : "error",
    statusCode,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === "development" && statusCode >= 500 && { stack: err.stack })
  });
};
