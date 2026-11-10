import fs from "fs";
import * as attachmentService from "../services/attachment.service.js";
import { BadRequestError, NotFoundError } from "../utils/AppError.js";

export const uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new BadRequestError("File is required for upload.");
    }
    const attachment = await attachmentService.createAttachment(
      req.params.taskId,
      req.user._id,
      req.file
    );
    res.status(201).json({ status: "success", data: attachment });
  } catch (error) {
    next(error);
  }
};

export const getAttachments = async (req, res, next) => {
  try {
    const attachments = await attachmentService.getAttachmentsByTask(req.params.taskId);
    res.status(200).json({ status: "success", data: attachments });
  } catch (error) {
    next(error);
  }
};

export const downloadAttachment = async (req, res, next) => {
  try {
    const attachment = await attachmentService.getAttachmentById(req.params.id);
    if (!fs.existsSync(attachment.storagePath)) {
      throw new NotFoundError("File not found on storage disk.");
    }

    res.setHeader("Content-Disposition", `attachment; filename="${attachment.originalFileName}"`);
    res.setHeader("Content-Type", attachment.contentType);
    const fileStream = fs.createReadStream(attachment.storagePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

export const deleteAttachment = async (req, res, next) => {
  try {
    const result = await attachmentService.deleteAttachment(
      req.params.id,
      req.user._id,
      req.user.role
    );
    res.status(200).json({ status: "success", ...result });
  } catch (error) {
    next(error);
  }
};
