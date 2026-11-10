import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    originalFileName: {
      type: String,
      required: true
    },
    storedFileName: {
      type: String,
      required: true
    },
    contentType: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    storagePath: {
      type: String,
      required: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

export const Attachment = mongoose.model("Attachment", attachmentSchema);
