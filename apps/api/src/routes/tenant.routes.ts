import { Router } from "express";
import { z } from "zod";
import { tenantController } from "../controllers/tenant.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";

const router = Router();

// Protect all tenant routes with authentication
router.use(authenticate);

// Unit ID parameter validation schema (strictly rejecting unexpected format)
const unitParamsSchema = z
  .object({
    unitId: z
      .string({ required_error: "Unit ID is required" })
      .trim()
      .min(1, "Unit ID is required")
      .max(64, "Unit ID must not exceed 64 characters")
  })
  .strict();

router.get("/me", (req, res, next) => tenantController.getMyUnit(req, res, next));

// GET /api/tenant/unit/:unitId with server-side ownership enforcement
router.get(
  "/unit/:unitId",
  validateRequest({ params: unitParamsSchema }),
  (req, res, next) => tenantController.getUnitById(req, res, next)
);

export default router;

