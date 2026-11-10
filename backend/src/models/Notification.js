import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ["TASK_ASSIGNED", "TASK_STATUS_CHANGED", "TASK_COMMENT_ADDED", "PROJECT_ADDED", "SYSTEM"],
      default: "SYSTEM"
    },
    message: {
      type: String,
      required: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Notification = mongoose.model("Notification", notificationSchema);
