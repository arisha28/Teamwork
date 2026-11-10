import multer from "multer";
import path from "path";
import fs from "fs";
import { BadRequestError } from "../utils/AppError.js";

const uploadDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow images, documents, PDFs, zips, code files
  const allowedMime = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
    "text/plain",
    "application/json"
  ];

  if (allowedMime.includes(file.mimetype) || file.originalname.match(/\.(jpg|jpeg|png|gif|webp|pdf|docx?|zip|txt|json|md)$/i)) {
    cb(null, true);
  } else {
    cb(new BadRequestError("Unsupported file type"), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter
});
