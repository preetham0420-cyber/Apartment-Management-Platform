import express from "express";
import cors from "cors";
import { config } from "./config/environment.js";
import { securityHeaders } from "./middleware/security-headers.middleware.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import tenantRoutes from "./routes/tenant.routes.js";
import residentRoutes from "./routes/resident.routes.js";
import visitorRoutes from "./routes/visitor.routes.js";
import maintenanceRoutes from "./routes/maintenance.routes.js";
import duesRoutes from "./routes/dues.routes.js";
import amenityRoutes from "./routes/amenity.routes.js";
import documentRoutes from "./routes/document.routes.js";
import path from "path";
import fs from "fs";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

// Security Hardening: Disable Express fingerprint banner
app.disable("x-powered-by");

// Defensive Security Headers (CSP, anti-clickjacking, MIME-sniffing protection)
app.use(securityHeaders);

// Strict CORS Origin Validation
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (e.g. mobile apps, server-to-server, curl)
      if (!origin) return callback(null, true);
      const normalized = origin.trim().replace(/\/$/, "");
      if (config.corsOrigins.includes(normalized)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS violation: Origin '${origin}' is not authorized.`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);

// Payload limit: allow up to 10mb for attachments / documents
app.use(express.json({ limit: "10mb" }));

// Ensure uploads directory exists
const uploadsDir = path.resolve(process.cwd(), "uploads", "maintenance");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

import { propertyRepository } from "./repositories/property.repository.js";

// API Route Registration
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tenant", tenantRoutes);
app.use("/api/resident", residentRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/dues", duesRoutes);
app.use("/api", amenityRoutes);
app.use("/api", documentRoutes);
app.get("/api/units", async (_req, res, next) => {
  try {
    const units = await propertyRepository.getAllUnits();
    res.status(200).json({ success: true, data: units });
  } catch (err) {
    next(err);
  }
});

// Fallthrough handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Server startup
app.listen(config.port, "0.0.0.0", () => {
  console.log(`[API Server] Running in ${config.nodeEnv} mode on http://0.0.0.0:${config.port} (LAN: http://172.20.10.2:${config.port})`);
  console.log(`[API Server] Health endpoint ready at http://localhost:${config.port}/api/health`);
  console.log(`[API Server] Auth endpoint ready at http://localhost:${config.port}/api/auth/login`);
});

export { AppError } from "./errors/app-error.js";
export { validateRequest } from "./middleware/validate.middleware.js";
export { authenticate, requireRole } from "./middleware/auth.middleware.js";
export default app;
