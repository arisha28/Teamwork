import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "BLOCKED", "DONE", "ARCHIVED"],
      default: "TODO",
      index: true
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
      index: true
    },
    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    dueDate: {
      type: Date
    },
    version: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ title: "text", description: "text" });

export const Task = mongoose.model("Task", taskSchema);
