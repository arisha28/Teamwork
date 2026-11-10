import express from "express";
import * as projectController from "../controllers/project.controller.js";
import * as taskController from "../controllers/task.controller.js";
import * as dashboardController from "../controllers/dashboard.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireProjectAdmin, requireProjectMember } from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(authenticate);

// Projects
router.post("/", projectController.createProject);
router.get("/", projectController.getProjects);
router.get("/:projectId", requireProjectMember("projectId"), projectController.getProject);
router.put("/:projectId", requireProjectAdmin("projectId"), projectController.updateProject);

// Members
router.post("/:projectId/members", requireProjectAdmin("projectId"), projectController.addMember);
router.delete("/:projectId/members/:userId", requireProjectAdmin("projectId"), projectController.removeMember);

// Tasks under project
router.post("/:projectId/tasks", requireProjectMember("projectId"), taskController.createTask);
router.get("/:projectId/tasks", requireProjectMember("projectId"), taskController.getTasks);

// Dashboard
router.get("/:projectId/dashboard", requireProjectMember("projectId"), dashboardController.getDashboard);

export default router;
