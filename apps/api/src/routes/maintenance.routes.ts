import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import { maintenanceController } from "../controllers/maintenance.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";

const router = Router();

router.use(authenticate);

// Secure in-memory multer handler with 5MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB strictly enforced
  }
});

const attachmentSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  fileUrl: z.string().trim().min(1).max(1024),
  fileSize: z.number().int().positive().max(5242880, "Attachment cannot exceed 5MB"),
  mimeType: z.enum(["image/jpeg", "image/png", "application/pdf"], {
    errorMap: () => ({ message: "Only image/jpeg, image/png, and application/pdf are permitted" })
  })
});

const createMaintenanceSchema = z
  .object({
    category: z.enum(["PLUMBING", "ELECTRICAL", "CARPENTRY", "APPLIANCE", "COMMON_AREA", "OTHER"]),
    title: z.string().trim().min(3, "Title must be at least 3 characters").max(255),
    description: z.string().trim().min(5, "Description must be at least 5 characters").max(2000),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "EMERGENCY"]).optional(),
    attachments: z.array(attachmentSchema).max(5, "Maximum 5 attachments allowed").optional()
  })
  .strict();

const idParamSchema = z
  .object({
    id: z.string().trim().min(1).max(64)
  })
  .strict();

const updateMaintenanceSchema = z
  .object({
    status: z.enum(["REPORTED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED", "CANCELLED"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "EMERGENCY"]).optional(),
    assignedToUserId: z.string().trim().max(64).optional()
  })
  .strict();

const commentSchema = z
  .object({
    comment: z.string().trim().min(1, "Comment cannot be empty").max(1000)
  })
  .strict();

router.get("/", (req, res, next) => maintenanceController.getMaintenance(req, res, next));
router.post(
  "/",
  validateRequest({ body: createMaintenanceSchema }),
  (req, res, next) => maintenanceController.createMaintenance(req, res, next)
);
router.post(
  "/upload",
  upload.single("file"),
  (req, res, next) => maintenanceController.uploadAttachment(req, res, next)
);
router.post(
  "/:id/attachments",
  upload.single("file"),
  (req, res, next) => maintenanceController.uploadAttachment(req, res, next)
);
router.patch(
  "/:id",
  validateRequest({ params: idParamSchema, body: updateMaintenanceSchema }),
  (req, res, next) => maintenanceController.updateMaintenance(req, res, next)
);
router.post(
  "/:id/comments",
  validateRequest({ params: idParamSchema, body: commentSchema }),
  (req, res, next) => maintenanceController.addComment(req, res, next)
);

export default router;
