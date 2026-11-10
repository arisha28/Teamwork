import express from "express";
import * as taskController from "../controllers/task.controller.js";
import * as commentController from "../controllers/comment.controller.js";
import * as attachmentController from "../controllers/attachment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.use(authenticate);

// Tasks CRUD
router.get("/tasks/:id", taskController.getTask);
router.put("/tasks/:id", taskController.updateTask);
router.patch("/tasks/:id/status", taskController.updateTaskStatus);
router.patch("/tasks/:id/reopen", taskController.reopenTask);
router.delete("/tasks/:id", taskController.deleteTask);
router.get("/tasks/:id/history", taskController.getTaskHistory);

// Comments
router.post("/tasks/:taskId/comments", commentController.createComment);
router.get("/tasks/:taskId/comments", commentController.getComments);
router.put("/comments/:commentId", commentController.updateComment);
router.delete("/comments/:commentId", commentController.deleteComment);

// Attachments
router.post("/tasks/:taskId/attachments", upload.single("file"), attachmentController.uploadAttachment);
router.get("/tasks/:taskId/attachments", attachmentController.getAttachments);
router.get("/attachments/:id/download", attachmentController.downloadAttachment);
router.delete("/attachments/:id", attachmentController.deleteAttachment);

export default router;
