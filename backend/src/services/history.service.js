import { TaskHistory } from "../models/TaskHistory.js";
import { domainEvents } from "../utils/eventEmitter.js";

export const getHistoryByTaskId = async (taskId) => {
  return TaskHistory.find({ taskId })
    .populate("changedBy", "name email")
    .sort({ changedAt: -1 });
};

// Event listener for recording history automatically
domainEvents.on("task.updated", async ({ task, oldTask, changedBy }) => {
  try {
    const fieldsToTrack = ["title", "description", "status", "priority", "assigneeId", "dueDate"];
    const historyEntries = [];

    for (const field of fieldsToTrack) {
      let oldVal = oldTask[field];
      let newVal = task[field];

      if (field === "assigneeId") {
        oldVal = oldVal ? oldVal.toString() : null;
        newVal = newVal ? (newVal._id ? newVal._id.toString() : newVal.toString()) : null;
      } else if (field === "dueDate") {
        oldVal = oldVal ? new Date(oldVal).toISOString() : null;
        newVal = newVal ? new Date(newVal).toISOString() : null;
      }

      if (oldVal !== newVal) {
        historyEntries.push({
          taskId: task._id,
          changedBy,
          fieldName: field,
          oldValue: oldVal,
          newValue: newVal,
          changedAt: new Date()
        });
      }
    }

    if (historyEntries.length > 0) {
      await TaskHistory.insertMany(historyEntries);
    }
  } catch (error) {
    console.error("[TaskHistory] Error logging change history:", error);
  }
});
