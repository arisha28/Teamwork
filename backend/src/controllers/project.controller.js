import * as projectService from "../services/project.service.js";

export const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.body, req.user._id);
    res.status(201).json({ status: "success", data: project });
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getProjectsForUser(req.user._id, req.user.role);
    res.status(200).json({ status: "success", data: projects });
  } catch (error) {
    next(error);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.projectId);
    res.status(200).json({ status: "success", data: project });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.projectId, req.body);
    res.status(200).json({ status: "success", data: project });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const project = await projectService.addProjectMember(req.params.projectId, req.body);
    res.status(200).json({ status: "success", data: project });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const project = await projectService.removeProjectMember(req.params.projectId, req.params.userId);
    res.status(200).json({ status: "success", data: project });
  } catch (error) {
    next(error);
  }
};
