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
    expectedArrival: z.string().datetime({ message: "Valid ISO arrival timestamp is required" }),
    visitorType: z.enum(["GUEST", "DELIVERY", "CAB", "SERVICE", "OTHER"]).optional(),
    vehicleNumber: z.string().trim().max(30).optional(),
    notes: z.string().trim().max(500).optional()
  })
  .strict();

const createWalkInSchema = z
  .object({
    unitId: z.string().trim().min(1, "Unit ID is required").max(64),
    visitorName: z.string().trim().min(2, "Visitor name is required").max(150),
    visitorPhone: z.string().trim().min(5, "Valid phone number is required").max(20),
    purpose: z.string().trim().max(100).optional(),
    visitorType: z.enum(["GUEST", "DELIVERY", "CAB", "SERVICE", "OTHER"]).optional(),
    vehicleNumber: z.string().trim().max(30).optional(),
    notes: z.string().trim().max(500).optional()
  })
  .strict();

const visitorIdParamSchema = z
  .object({
    id: z.string().trim().min(1).max(64)
  })
  .strict();

const rejectVisitorSchema = z
  .object({
    rejectionReason: z.string().trim().max(255).optional()
  })
  .strict();

const updateVisitorStatusSchema = z
  .object({
    status: z.enum([
      "PENDING",
      "APPROVED",
      "PRE_APPROVED",
      "AT_GATE",
      "CHECKED_IN",
      "CHECKED_OUT",
      "REJECTED",
      "EXPIRED",
      "CANCELLED"
    ])
  })
  .strict();

// 1. List visitors (with optional query filters)
router.get("/", (req, res, next) => visitorController.getVisitors(req, res, next));

// 2. Pending resident approvals queue
router.get("/pending", (req, res, next) => visitorController.getPendingApprovals(req, res, next));

// 3. Visitor detail by ID
router.get(
  "/:id",
  validateRequest({ params: visitorIdParamSchema }),
  (req, res, next) => visitorController.getVisitorById(req, res, next)
);

// 4. Resident pre-approves a visitor
router.post(
  "/",
  validateRequest({ body: createVisitorSchema }),
  (req, res, next) => visitorController.createVisitor(req, res, next)
);

// 5. Gate / Security Guard creates walk-in visitor request
router.post(
  "/walk-in",
  validateRequest({ body: createWalkInSchema }),
  (req, res, next) => visitorController.createWalkInVisitor(req, res, next)
);

// 6. Resident approves visitor entry
router.patch(
  "/:id/approve",
  validateRequest({ params: visitorIdParamSchema }),
  (req, res, next) => visitorController.approveVisitor(req, res, next)
);

// 7. Resident rejects visitor entry
router.patch(
  "/:id/reject",
  validateRequest({ params: visitorIdParamSchema, body: rejectVisitorSchema }),
  (req, res, next) => visitorController.rejectVisitor(req, res, next)
);

// 8. General status update (guard check-in, check-out, cancel)
router.patch(
  "/:id/status",
  validateRequest({ params: visitorIdParamSchema, body: updateVisitorStatusSchema }),
  (req, res, next) => visitorController.updateVisitorStatus(req, res, next)
);

export default router;
