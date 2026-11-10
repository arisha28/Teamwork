import * as taskService from "../services/task.service.js";
import * as historyService from "../services/history.service.js";

export const createTask = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.projectId;
    const task = await taskService.createTask({ ...req.body, projectId }, req.user._id);
    res.status(201).json({ status: "success", data: task });
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req, res, next) => {
  try {
    const result = await taskService.getTasksByProject(req.params.projectId, req.query);
    res.status(200).json({ status: "success", ...result });
  } catch (error) {
    next(error);
  }
};

export const getTask = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    res.status(200).json({ status: "success", data: task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body, req.user._id, req.user.role);
    res.status(200).json({ status: "success", data: task });
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req, res, next) => {
  try {
    const { status, version } = req.body;
    const task = await taskService.updateTask(
      req.params.id,
      { status, version },
      req.user._id,
      req.user.role
    );
    res.status(200).json({ status: "success", data: task });
  } catch (error) {
    next(error);
  }
};

export const reopenTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(
      req.params.id,
      { status: "TODO", isReopen: true, version: req.body.version },
      req.user._id,
      req.user.role
    );
    res.status(200).json({ status: "success", data: task });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const result = await taskService.deleteTask(req.params.id, req.user._id, req.user.role);
    res.status(200).json({ status: "success", ...result });
  } catch (error) {
    next(error);
  }
};

export const getTaskHistory = async (req, res, next) => {
  try {
    const history = await historyService.getHistoryByTaskId(req.params.id);
    res.status(200).json({ status: "success", data: history });
  } catch (error) {
    next(error);
  }
};
