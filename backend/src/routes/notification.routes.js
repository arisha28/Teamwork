import express from "express";
import * as notificationController from "../controllers/notification.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", notificationController.getNotifications);
router.patch("/read-all", notificationController.markAllRead);
router.patch("/:id/read", notificationController.markRead);

export default router;
