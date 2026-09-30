import express from "express";
import cors from "cors";
import { config } from "./config/environment.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import tenantRoutes from "./routes/tenant.routes.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

// Security and utility middleware
app.use(cors({
  origin: config.corsOrigins,
  credentials: true
}));
app.use(express.json());

// API Route Registration
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tenant", tenantRoutes);

// Fallthrough handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Server startup
app.listen(config.port, () => {
  console.log(`[API Server] Running in ${config.nodeEnv} mode on http://localhost:${config.port}`);
  console.log(`[API Server] Health endpoint ready at http://localhost:${config.port}/api/health`);
  console.log(`[API Server] Auth endpoint ready at http://localhost:${config.port}/api/auth/login`);
});

export { AppError } from "./errors/app-error.js";
export { validateRequest } from "./middleware/validate.middleware.js";
export { authenticate, requireRole } from "./middleware/auth.middleware.js";
export default app;
