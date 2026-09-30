import { Router } from "express";
import { adminController } from "../controllers/admin.controller.js";
import { authenticate, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Strictly protect all admin routes with authentication AND SUPER_ADMIN role authorization
router.use(authenticate);
router.use(requireRole("SUPER_ADMIN"));

router.get("/overview", (req, res, next) => adminController.getOverview(req, res, next));

export default router;
