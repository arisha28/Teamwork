import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { config } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { httpLogger } from "./middlewares/logger.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { NotFoundError } from "./utils/AppError.js";
import { logger } from "./utils/logger.js";

// Routes
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

// Initialize express app
const app = express();

// Security and utility middlewares
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(httpLogger);

// Static files for uploads
app.use("/uploads", express.static(path.resolve(process.cwd(), config.uploadPath)));

// API Routes
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api", taskRoutes);
app.use("/api/notifications", notificationRoutes);

// Catch-all for undefined routes
app.all("*", (req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found.`));
});

// Global error handling middleware
app.use(errorHandler);

// Start server if not running in test mode
if (process.env.NODE_ENV !== "test") {
  connectDB().then(() => {
    const server = app.listen(config.port, () => {
      logger.info(`[Server] TeamWork API listening on port ${config.port} in ${config.nodeEnv} mode`);
    });

    const shutdown = () => {
      logger.info("[Server] Gracefully shutting down...");
      server.close(() => {
        logger.info("[Server] HTTP server closed.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  });
}

export default app;
