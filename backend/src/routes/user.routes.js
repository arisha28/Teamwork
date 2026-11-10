import express from "express";
import * as userController from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireSystemAdmin } from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", userController.getUsers);
router.get("/:id", userController.getUser);
router.put("/:id", userController.updateUser);
router.patch("/:id/status", requireSystemAdmin, userController.setUserStatus);

export default router;
