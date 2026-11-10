import { ForbiddenError, NotFoundError } from "../utils/AppError.js";
import { Project } from "../models/Project.js";

export const requireSystemAdmin = (req, res, next) => {
  if (req.user && req.user.role === "SYSTEM_ADMIN") {
    return next();
  }
  next(new ForbiddenError("Action requires System Admin privileges."));
};

export const requireProjectAdmin = (paramKey = "projectId") => {
  return async (req, res, next) => {
    try {
      if (req.user.role === "SYSTEM_ADMIN") return next();

      const projectId = req.params[paramKey] || req.body.projectId;
      if (!projectId) {
        return next(new ForbiddenError("Project ID is required to verify permissions."));
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return next(new NotFoundError("Project not found."));
      }

      const isOwner = project.ownerId.toString() === req.user._id.toString();
      const member = project.members.find(
        (m) => m.userId.toString() === req.user._id.toString()
      );
      const isProjectAdmin = member && member.role === "ADMIN";

      if (isOwner || isProjectAdmin) {
        req.project = project;
        return next();
      }

      next(new ForbiddenError("Only project administrators or owners can perform this action."));
    } catch (error) {
      next(error);
    }
  };
};

export const requireProjectMember = (paramKey = "projectId") => {
  return async (req, res, next) => {
    try {
      if (req.user.role === "SYSTEM_ADMIN") return next();

      const projectId = req.params[paramKey] || req.body.projectId;
      if (!projectId) {
        return next(new ForbiddenError("Project ID is required."));
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return next(new NotFoundError("Project not found."));
      }

      const isOwner = project.ownerId.toString() === req.user._id.toString();
      const isMember = project.members.some(
        (m) => m.userId.toString() === req.user._id.toString()
      );

      if (isOwner || isMember) {
        req.project = project;
        return next();
      }

      next(new ForbiddenError("You must be a member of this project to access this resource."));
    } catch (error) {
      next(error);
    }
  };
};
