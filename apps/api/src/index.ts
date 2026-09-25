import express from "express";
import cors from "cors";
import { config } from "./config/environment.js";
import healthRoutes from "./routes/health.routes.js";
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

// Fallthrough handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Server startup
app.listen(config.port, () => {
  console.log(`[API Server] Running in ${config.nodeEnv} mode on http://localhost:${config.port}`);
  console.log(`[API Server] Health endpoint ready at http://localhost:${config.port}/api/health`);
});

export default app;
