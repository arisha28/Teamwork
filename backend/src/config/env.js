import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/teamwork",
  jwtSecret: process.env.JWT_SECRET || "teamwork-default-jwt-secret-key-9999",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  uploadPath: process.env.UPLOAD_PATH || "uploads"
};
