import { Comment } from "../models/Comment.js";
import { Task } from "../models/Task.js";
import { NotFoundError, ForbiddenError } from "../utils/AppError.js";
import { domainEvents } from "../utils/eventEmitter.js";

export const createComment = async (taskId, authorId, content) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new NotFoundError("Task not found.");
  }

  const comment = await Comment.create({
    taskId,
    authorId,
    content
  });

  const populated = await Comment.findById(comment._id).populate("authorId", "name email");

  domainEvents.emit("comment.created", {
    comment: populated,
    task,
    authorId
  });

  return populated;
};

export const getCommentsByTask = async (taskId) => {
  return Comment.find({ taskId })
    .populate("authorId", "name email")
    .sort({ createdAt: 1 });
};

export const updateComment = async (commentId, authorId, content) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new NotFoundError("Comment not found.");
  }

  if (comment.authorId.toString() !== authorId.toString()) {
    throw new ForbiddenError("You can only edit your own comments.");
  }

  comment.content = content;
  await comment.save();

  return Comment.findById(commentId).populate("authorId", "name email");
};

export const deleteComment = async (commentId, userId, userRole) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new NotFoundError("Comment not found.");
  }

  const isAuthor = comment.authorId.toString() === userId.toString();
  const isAdmin = userRole === "SYSTEM_ADMIN" || userRole === "PROJECT_ADMIN";

  if (!isAuthor && !isAdmin) {
    throw new ForbiddenError("You cannot delete this comment.");
  }

  await Comment.findByIdAndDelete(commentId);
  return { message: "Comment deleted successfully." };
};
