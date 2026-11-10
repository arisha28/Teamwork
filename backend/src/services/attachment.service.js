import fs from "fs";
import path from "path";
import { Attachment } from "../models/Attachment.js";
import { Task } from "../models/Task.js";
import { NotFoundError, ForbiddenError } from "../utils/AppError.js";

export const createAttachment = async (taskId, userId, file) => {
  const task = await Task.findById(taskId);
  if (!task) {
    if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    throw new NotFoundError("Task not found.");
  }

  const attachment = await Attachment.create({
    taskId,
    uploadedBy: userId,
    originalFileName: file.originalname,
    storedFileName: file.filename,
    contentType: file.mimetype,
    fileSize: file.size,
    storagePath: file.path
  });

  return Attachment.findById(attachment._id).populate("uploadedBy", "name email");
};

export const getAttachmentsByTask = async (taskId) => {
  return Attachment.find({ taskId })
    .populate("uploadedBy", "name email")
    .sort({ createdAt: -1 });
};

export const getAttachmentById = async (attachmentId) => {
  const attachment = await Attachment.findById(attachmentId);
  if (!attachment) {
    throw new NotFoundError("Attachment not found.");
  }
  return attachment;
};

export const deleteAttachment = async (attachmentId, userId, userRole) => {
  const attachment = await Attachment.findById(attachmentId);
  if (!attachment) {
    throw new NotFoundError("Attachment not found.");
  }

  const isUploader = attachment.uploadedBy.toString() === userId.toString();
  const isAdmin = userRole === "SYSTEM_ADMIN" || userRole === "PROJECT_ADMIN";

  if (!isUploader && !isAdmin) {
    throw new ForbiddenError("Not authorized to delete this attachment.");
  }

  if (fs.existsSync(attachment.storagePath)) {
    try {
      fs.unlinkSync(attachment.storagePath);
    } catch (err) {
      console.error("Failed to delete attachment file from disk:", err);
    }
  }

  await Attachment.findByIdAndDelete(attachmentId);
  return { message: "Attachment deleted successfully." };
};
