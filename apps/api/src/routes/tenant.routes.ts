import { Router } from "express";
import { tenantController } from "../controllers/tenant.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Protect all tenant routes with authentication
router.use(authenticate);

router.get("/me", (req, res, next) => tenantController.getMyUnit(req, res, next));

export default router;
