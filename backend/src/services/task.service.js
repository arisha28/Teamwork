import { Task } from "../models/Task.js";
import { Project } from "../models/Project.js";
import { BadRequestError, NotFoundError, ForbiddenError, ConflictError } from "../utils/AppError.js";
import { domainEvents } from "../utils/eventEmitter.js";

export const createTask = async (taskData, reporterId) => {
  const { projectId, assigneeId, dueDate, title, description, priority } = taskData;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError("Project not found.");
  }

  if (project.status === "ARCHIVED") {
    throw new BadRequestError("Cannot add tasks to an archived project.");
  }

  // Business Rule: Assignee must be a member of the project
  if (assigneeId) {
    const isMember = project.members.some(
      (m) => m.userId.toString() === assigneeId.toString()
    ) || project.ownerId.toString() === assigneeId.toString();

    if (!isMember) {
      throw new BadRequestError("Task assignee must be a member of the project.");
    }
  }

  // Business Rule: Due date cannot be before project start date
  if (dueDate && project.startDate) {
    const due = new Date(dueDate);
    const start = new Date(project.startDate);
    if (due < start) {
      throw new BadRequestError("Task due date cannot be earlier than project start date.");
    }
  }

  const task = await Task.create({
    projectId,
    title,
    description: description || "",
    status: "TODO",
    priority: priority || "MEDIUM",
    assigneeId: assigneeId || null,
    reporterId,
    dueDate: dueDate || null,
    version: 0
  });

  const populatedTask = await Task.findById(task._id)
    .populate("assigneeId", "name email")
    .populate("reporterId", "name email");

  domainEvents.emit("task.created", { task: populatedTask, createdBy: reporterId });

  if (assigneeId && assigneeId.toString() !== reporterId.toString()) {
    domainEvents.emit("task.assigned", {
      taskId: task._id,
      taskTitle: task.title,
      assigneeId,
      assignedBy: reporterId
    });
  }

  return populatedTask;
};

export const getTasksByProject = async (projectId, queryParams = {}) => {
  const {
    page = 1,
    limit = 20,
    status,
    priority,
    assigneeId,
    search,
    sort = "createdAt:desc"
  } = queryParams;

  const filter = { projectId };

  if (status) {
    filter.status = status;
  }
  if (priority) {
    filter.priority = priority;
  }
  if (assigneeId) {
    filter.assigneeId = assigneeId;
  }
  if (search && search.trim() !== "") {
    filter.$or = [
      { title: { $regex: search.trim(), $options: "i" } },
      { description: { $regex: search.trim(), $options: "i" } }
    ];
  }

  // Parse sort (e.g. 'dueDate:asc' or 'createdAt:desc')
  const sortObj = {};
  if (sort) {
    const [field, order] = sort.split(":");
    sortObj[field] = order === "asc" ? 1 : -1;
  } else {
    sortObj.createdAt = -1;
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [total, tasks] = await Promise.all([
    Task.countDocuments(filter),
    Task.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .populate("assigneeId", "name email")
      .populate("reporterId", "name email")
      .lean()
  ]);

  return {
    data: tasks,
    pagination: {
      total,
      pages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      limit: limitNum
    }
  };
};

export const getTaskById = async (taskId) => {
  const task = await Task.findById(taskId)
    .populate("assigneeId", "name email")
    .populate("reporterId", "name email")
    .populate("projectId", "name status startDate endDate");

  if (!task) {
    throw new NotFoundError("Task not found.");
  }
  return task;
};

export const updateTask = async (taskId, updateData, userId, userRole) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new NotFoundError("Task not found.");
  }

  const project = await Project.findById(task.projectId);
  if (!project) {
    throw new NotFoundError("Associated project not found.");
  }

  // Business Rule: An archived task cannot be modified
  if (task.status === "ARCHIVED" && updateData.status !== "ARCHIVED") {
    // Only Project Admin / System Admin can unarchive
    const isOwner = project.ownerId.toString() === userId.toString();
    const isAdmin = project.members.some(
      (m) => m.userId.toString() === userId.toString() && m.role === "ADMIN"
    ) || userRole === "SYSTEM_ADMIN" || isOwner;

    if (!isAdmin) {
      throw new ForbiddenError("Only project administrators can modify an archived task.");
    }
  } else if (task.status === "ARCHIVED" && !updateData.status) {
    throw new BadRequestError("An archived task cannot be modified.");
  }

  // Optimistic Concurrency Control (OCC)
  if (updateData.version !== undefined && updateData.version !== task.version) {
    throw new ConflictError(
      "Conflict detected: This task was modified by another user. Please refresh and retry."
    );
  }

  // Business Rule: Assignee must belong to project
  if (updateData.assigneeId && updateData.assigneeId !== task.assigneeId?.toString()) {
    const isMember = project.members.some(
      (m) => m.userId.toString() === updateData.assigneeId.toString()
    ) || project.ownerId.toString() === updateData.assigneeId.toString();

    if (!isMember) {
      throw new BadRequestError("Task assignee must be a member of the project.");
    }
  }

  // Business Rule: Due date cannot be before project start date
  if (updateData.dueDate && project.startDate) {
    const due = new Date(updateData.dueDate);
    const start = new Date(project.startDate);
    if (due < start) {
      throw new BadRequestError("Task due date cannot be earlier than project start date.");
    }
  }

  // Business Rule: Completed task cannot move directly to TODO without reopen action
  if (task.status === "DONE" && updateData.status === "TODO" && !updateData.isReopen) {
    throw new BadRequestError("A completed task cannot move directly to TODO without a reopen action.");
  }

  // Business Rule: Only project admin can archive or delete
  if (updateData.status === "ARCHIVED" && task.status !== "ARCHIVED") {
    const isOwner = project.ownerId.toString() === userId.toString();
    const isAdmin = project.members.some(
      (m) => m.userId.toString() === userId.toString() && m.role === "ADMIN"
    ) || userRole === "SYSTEM_ADMIN" || isOwner;

    if (!isAdmin) {
      throw new ForbiddenError("Only project administrators can archive tasks.");
    }
  }

  const oldTask = task.toObject();

  // Apply updates
  const fields = ["title", "description", "status", "priority", "assigneeId", "dueDate"];
  for (const field of fields) {
    if (updateData[field] !== undefined) {
      task[field] = updateData[field];
    }
  }

  task.version = (task.version || 0) + 1;
  await task.save();

  const updatedTask = await Task.findById(taskId)
    .populate("assigneeId", "name email")
    .populate("reporterId", "name email");

  domainEvents.emit("task.updated", {
    task: updatedTask,
    oldTask,
    changedBy: userId
  });

  return updatedTask;
};

export const deleteTask = async (taskId, userId, userRole) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new NotFoundError("Task not found.");
  }

  const project = await Project.findById(task.projectId);
  if (!project) {
    throw new NotFoundError("Project not found.");
  }

  // Business Rule: Only project admins can delete tasks
  const isOwner = project.ownerId.toString() === userId.toString();
  const isAdmin = project.members.some(
    (m) => m.userId.toString() === userId.toString() && m.role === "ADMIN"
  ) || userRole === "SYSTEM_ADMIN" || isOwner;

  if (!isAdmin) {
    throw new ForbiddenError("Only project administrators can delete tasks.");
  }

  await Task.findByIdAndDelete(taskId);
  domainEvents.emit("task.deleted", { taskId, projectId: task.projectId });
  return { message: "Task deleted successfully." };
};
