import { Project } from "../models/Project.js";
import { User } from "../models/User.js";
import { NotFoundError, BadRequestError } from "../utils/AppError.js";
import { domainEvents } from "../utils/eventEmitter.js";

export const createProject = async (projectData, userId) => {
  const project = await Project.create({
    ...projectData,
    ownerId: userId,
    members: [
      {
        userId,
        role: "ADMIN",
        joinedAt: new Date()
      }
    ]
  });

  return project.populate("ownerId", "name email");
};

export const getProjectsForUser = async (userId, userRole) => {
  if (userRole === "SYSTEM_ADMIN") {
    return Project.find()
      .populate("ownerId", "name email")
      .populate("members.userId", "name email")
      .sort({ createdAt: -1 });
  }

  return Project.find({
    $or: [{ ownerId: userId }, { "members.userId": userId }]
  })
    .populate("ownerId", "name email")
    .populate("members.userId", "name email")
    .sort({ createdAt: -1 });
};

export const getProjectById = async (projectId) => {
  const project = await Project.findById(projectId)
    .populate("ownerId", "name email role")
    .populate("members.userId", "name email role status");

  if (!project) {
    throw new NotFoundError("Project not found.");
  }
  return project;
};

export const updateProject = async (projectId, updateData) => {
  const allowed = ["name", "description", "status", "startDate", "endDate"];
  const updates = {};
  for (const key of allowed) {
    if (updateData[key] !== undefined) updates[key] = updateData[key];
  }

  const project = await Project.findByIdAndUpdate(projectId, updates, {
    new: true,
    runValidators: true
  })
    .populate("ownerId", "name email")
    .populate("members.userId", "name email");

  if (!project) {
    throw new NotFoundError("Project not found.");
  }
  return project;
};

export const addProjectMember = async (projectId, { userId, role = "MEMBER" }) => {
  const user = await User.findById(userId);
  if (!user || user.status === "disabled") {
    throw new NotFoundError("Valid active user required.");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError("Project not found.");
  }

  const existingMember = project.members.find(
    (m) => m.userId.toString() === userId.toString()
  );

  if (existingMember) {
    existingMember.role = role;
  } else {
    project.members.push({ userId, role, joinedAt: new Date() });
  }

  await project.save();

  domainEvents.emit("project.memberAdded", {
    projectId,
    userId,
    projectName: project.name
  });

  return getProjectById(projectId);
};

export const removeProjectMember = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError("Project not found.");
  }

  if (project.ownerId.toString() === userId.toString()) {
    throw new BadRequestError("Project owner cannot be removed from project members.");
  }

  project.members = project.members.filter(
    (m) => m.userId.toString() !== userId.toString()
  );

  await project.save();
  return getProjectById(projectId);
};
