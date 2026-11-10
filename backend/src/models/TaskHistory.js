import mongoose from "mongoose";

const taskHistorySchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true,
    index: true
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  fieldName: {
    type: String,
    required: true
  },
  oldValue: {
    type: mongoose.Schema.Types.Mixed
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed
  },
  changedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

export const TaskHistory = mongoose.model("TaskHistory", taskHistorySchema);
