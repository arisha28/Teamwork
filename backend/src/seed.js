import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "./config/env.js";
import { User } from "./models/User.js";
import { Project } from "./models/Project.js";
import { Task } from "./models/Task.js";
import { Comment } from "./models/Comment.js";
import { TaskHistory } from "./models/TaskHistory.js";
import { Notification } from "./models/Notification.js";

const seedDatabase = async () => {
  try {
    console.log("[Seeder] Connecting to database:", config.mongodbUri);
    await mongoose.connect(config.mongodbUri);
    console.log("[Seeder] Connected successfully!");

    // Clean existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Comment.deleteMany({});
    await TaskHistory.deleteMany({});
    await Notification.deleteMany({});
    console.log("[Seeder] Cleared previous collections.");

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("password123", salt);

    // Create 3 standard roles
    const adminUser = await User.create({
      name: "System Administrator",
      email: "admin@teamwork.local",
      passwordHash,
      role: "SYSTEM_ADMIN",
      status: "active"
    });

    const pmUser = await User.create({
      name: "Sarah Project Manager",
      email: "pm@teamwork.local",
      passwordHash,
      role: "PROJECT_ADMIN",
      status: "active"
    });

    const devUser = await User.create({
      name: "Alex Fullstack Dev",
      email: "dev@teamwork.local",
      passwordHash,
      role: "REGULAR_USER",
      status: "active"
    });

    console.log("[Seeder] Users created:");
    console.log(" - Admin: admin@teamwork.local / password123");
    console.log(" - PM:    pm@teamwork.local / password123");
    console.log(" - Dev:   dev@teamwork.local / password123");

    // Create Sample Project
    const now = new Date();
    const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days ahead

    const project = await Project.create({
      name: "NextGen Cloud Platform",
      description: "Enterprise multi-tenant microservices deployment and task orchestration dashboard.",
      ownerId: pmUser._id,
      status: "ACTIVE",
      startDate,
      endDate,
      members: [
        { userId: pmUser._id, role: "ADMIN", joinedAt: startDate },
        { userId: devUser._id, role: "MEMBER", joinedAt: startDate },
        { userId: adminUser._id, role: "ADMIN", joinedAt: startDate }
      ]
    });

    console.log(`[Seeder] Project "${project.name}" created with 3 members.`);

    // Create Tasks
    const task1 = await Task.create({
      projectId: project._id,
      title: "Set up MongoDB Replicas and Indexing",
      description: "Configure MongoDB compound indexes on task searches and verify query explain plan.",
      status: "DONE",
      priority: "CRITICAL",
      assigneeId: devUser._id,
      reporterId: pmUser._id,
      dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      version: 1
    });

    const task2 = await Task.create({
      projectId: project._id,
      title: "Implement JWT Bearer Authentication & RBAC",
      description: "Support token verification, role permissions (Admin, PM, Member) and refresh flow.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      assigneeId: devUser._id,
      reporterId: pmUser._id,
      dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      version: 0
    });

    const task3 = await Task.create({
      projectId: project._id,
      title: "Design Responsive Kanban Board UI",
      description: "Build drag-and-drop or modal status transitions with real-time feedback and OCC guards.",
      status: "TODO",
      priority: "MEDIUM",
      assigneeId: devUser._id,
      reporterId: pmUser._id,
      dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      version: 0
    });

    const task4 = await Task.create({
      projectId: project._id,
      title: "Third-party Payment Gateway Webhooks",
      description: "Awaiting API credentials from payment provider.",
      status: "BLOCKED",
      priority: "HIGH",
      assigneeId: pmUser._id,
      reporterId: adminUser._id,
      dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // Overdue!
      version: 0
    });

    // Create Comments
    await Comment.create({
      taskId: task2._id,
      authorId: pmUser._id,
      content: "Please ensure token expiration is set according to security guidelines."
    });

    await Comment.create({
      taskId: task2._id,
      authorId: devUser._id,
      content: "Done! Expiration is configurable via .env and set to 7d for dev."
    });

    // Create Task History
    await TaskHistory.create({
      taskId: task1._id,
      changedBy: devUser._id,
      fieldName: "status",
      oldValue: "IN_PROGRESS",
      newValue: "DONE",
      changedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
    });

    // Create Notifications
    await Notification.create({
      userId: devUser._id,
      type: "TASK_ASSIGNED",
      message: `You were assigned to task: "${task2.title}"`,
      metadata: { taskId: task2._id, assignedBy: pmUser._id }
    });

    console.log("[Seeder] Seed data successfully populated!");
    process.exit(0);
  } catch (error) {
    console.error("[Seeder] Error populating database:", error);
    process.exit(1);
  }
};

seedDatabase();
