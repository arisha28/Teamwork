import { Notification } from "../models/Notification.js";
import { domainEvents } from "../utils/eventEmitter.js";

export const createNotification = async ({ userId, type, message, metadata = {} }) => {
  return Notification.create({
    userId,
    type,
    message,
    metadata
  });
};

export const getUserNotifications = async (userId) => {
  return Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(30);
};

export const markAsRead = async (notificationId, userId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );
};

export const markAllAsRead = async (userId) => {
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });
  return { message: "All notifications marked as read." };
};

// Domain event listeners for notifications
domainEvents.on("task.assigned", async ({ taskId, taskTitle, assigneeId, assignedBy }) => {
  try {
    await createNotification({
      userId: assigneeId,
      type: "TASK_ASSIGNED",
      message: `You were assigned to task: "${taskTitle}"`,
      metadata: { taskId, assignedBy }
    });
  } catch (err) {
    console.error("[Notification] Failed to create assignment notification:", err);
  }
});

domainEvents.on("comment.created", async ({ comment, task, authorId }) => {
  try {
    // Notify task assignee if someone else comments
    if (task.assigneeId && task.assigneeId.toString() !== authorId.toString()) {
      await createNotification({
        userId: task.assigneeId,
        type: "TASK_COMMENT_ADDED",
        message: `New comment on task: "${task.title}"`,
        metadata: { taskId: task._id, commentId: comment._id }
      });
    }
  } catch (err) {
    console.error("[Notification] Failed to create comment notification:", err);
  }
});
