import mongoose from "mongoose";
import { Task } from "../models/Task.js";
import { Project } from "../models/Project.js";
import { NotFoundError } from "../utils/AppError.js";

export const getProjectDashboard = async (projectId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError("Project not found.");
  }

  const pId = new mongoose.Types.ObjectId(projectId);
  const now = new Date();

  // Aggregation 1: Status distribution
  const statusStats = await Task.aggregate([
    { $match: { projectId: pId } },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  // Aggregation 2: Priority distribution
  const priorityStats = await Task.aggregate([
    { $match: { projectId: pId } },
    { $group: { _id: "$priority", count: { $sum: 1 } } }
  ]);

  // Aggregation 3: Assignee workload
  const assigneeStats = await Task.aggregate([
    { $match: { projectId: pId } },
    {
      $group: {
        _id: "$assigneeId",
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ["$status", "DONE"] }, 1, 0] }
        }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user"
      }
    },
    {
      $project: {
        assignee: {
          $cond: [
            { $gt: [{ $size: "$user" }, 0] },
            { $arrayElemAt: ["$user.name", 0] },
            "Unassigned"
          ]
        },
        total: 1,
        completed: 1
      }
    }
  ]);

  // Aggregation 4: Overdue tasks
  const overdueCount = await Task.countDocuments({
    projectId: pId,
    status: { $nin: ["DONE", "ARCHIVED"] },
    dueDate: { $lt: now }
  });

  const totalTasks = await Task.countDocuments({ projectId: pId });
  const completedTasks = await Task.countDocuments({ projectId: pId, status: "DONE" });

  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    project: {
      id: project._id,
      name: project.name,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      membersCount: project.members.length
    },
    totalTasks,
    completedTasks,
    overdueCount,
    progressPercentage,
    statusDistribution: statusStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
    priorityDistribution: priorityStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
    assigneeWorkload: assigneeStats
  };
};
