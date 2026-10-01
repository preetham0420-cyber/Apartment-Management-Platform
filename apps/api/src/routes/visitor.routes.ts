import { Router } from "express";
import { z } from "zod";
import { visitorController } from "../controllers/visitor.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";

const router = Router();

router.use(authenticate);

const createVisitorSchema = z
  .object({
    visitorName: z.string().trim().min(2, "Visitor name is required").max(150),
    visitorPhone: z.string().trim().min(5, "Valid phone number is required").max(20),
    purpose: z.string().trim().max(100).optional(),
    expectedArrival: z.string().datetime({ message: "Valid ISO arrival timestamp is required" })
  })
  .strict();

const visitorIdParamSchema = z
  .object({
    id: z.string().trim().min(1).max(64)
  })
  .strict();

const updateVisitorStatusSchema = z
  .object({
    status: z.enum(["PRE_APPROVED", "AT_GATE", "CHECKED_IN", "CHECKED_OUT", "REJECTED"])
  })
  .strict();

router.get("/", (req, res, next) => visitorController.getVisitors(req, res, next));
router.post(
  "/",
  validateRequest({ body: createVisitorSchema }),
  (req, res, next) => visitorController.createVisitor(req, res, next)
);
router.patch(
  "/:id/status",
  validateRequest({ params: visitorIdParamSchema, body: updateVisitorStatusSchema }),
  (req, res, next) => visitorController.updateVisitorStatus(req, res, next)
);

export default router;
