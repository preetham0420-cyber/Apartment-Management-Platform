import { Router } from "express";
import { z } from "zod";
import { adminController } from "../controllers/admin.controller.js";
import { authenticate, requireRole } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";

const router = Router();

// Strictly protect all admin routes with authentication AND SUPER_ADMIN role authorization
router.use(authenticate);
router.use(requireRole("SUPER_ADMIN"));

const idParamSchema = z
  .object({
    id: z.string().trim().min(1).max(64)
  })
  .strict();

const updateResidentStatusSchema = z
  .object({
    isActive: z.boolean({ required_error: "isActive is required" })
  })
  .strict();

const updateUnitStatusSchema = z
  .object({
    status: z.enum(["OCCUPIED", "VACANT", "UNDER_MAINTENANCE"])
  })
  .strict();

const createNoticeSchema = z
  .object({
    propertyId: z.string().trim().max(64).optional(),
    title: z.string().trim().min(3, "Title must be at least 3 characters").max(255),
    content: z.string().trim().min(5, "Content must be at least 5 characters"),
    category: z.string().trim().max(50).optional(),
    priority: z.enum(["LOW", "NORMAL", "URGENT"]).optional()
  })
  .strict();

const updatePropertySchema = z
  .object({
    name: z.string().trim().min(2, "Property name must be at least 2 characters").max(150).optional(),
    addressLine1: z.string().trim().min(3).max(255).optional(),
    addressLine2: z.string().trim().max(255).optional().nullable(),
    city: z.string().trim().min(2).max(100).optional(),
    state: z.string().trim().min(2).max(100).optional(),
    postalCode: z.string().trim().min(3).max(20).optional(),
    contactEmail: z.string().trim().email("Invalid contact email").optional(),
    contactPhone: z.string().trim().min(5).max(30).optional(),
    emergencyPhone: z.string().trim().min(5).max(30).optional(),
    rulesSummary: z.string().trim().max(3000).optional(),
    paymentInstructions: z.string().trim().max(3000).optional()
  })
  .strict();

router.get("/dashboard", (req, res, next) => adminController.getDashboard(req, res, next));
router.get("/overview", (req, res, next) => adminController.getOverview(req, res, next));
router.get("/residents", (req, res, next) => adminController.getResidents(req, res, next));
router.patch(
  "/residents/:id/status",
  validateRequest({ params: idParamSchema, body: updateResidentStatusSchema }),
  (req, res, next) => adminController.updateResidentStatus(req, res, next)
);
router.get("/maintenance", (req, res, next) => adminController.getAllMaintenance(req, res, next));
router.get("/properties", (req, res, next) => adminController.getProperties(req, res, next));
router.patch(
  "/properties/:id",
  validateRequest({ params: idParamSchema, body: updatePropertySchema }),
  (req, res, next) => adminController.updateProperty(req, res, next)
);
router.get("/units", (req, res, next) => adminController.getUnits(req, res, next));
router.patch(
  "/units/:id/status",
  validateRequest({ params: idParamSchema, body: updateUnitStatusSchema }),
  (req, res, next) => adminController.updateUnitStatus(req, res, next)
);
router.get("/visitors", (req, res, next) => adminController.getAllVisitors(req, res, next));
router.get("/dues", (req, res, next) => adminController.getAllDues(req, res, next));
router.get("/amenities", (req, res, next) => adminController.getAllAmenities(req, res, next));
router.get("/amenities/bookings", (req, res, next) => adminController.getAllBookings(req, res, next));
router.delete(
  "/amenities/bookings/:id",
  validateRequest({ params: idParamSchema }),
  (req, res, next) => adminController.cancelBooking(req, res, next)
);
router.get("/notices", (req, res, next) => adminController.getAllNotices(req, res, next));
router.post(
  "/notices",
  validateRequest({ body: createNoticeSchema }),
  (req, res, next) => adminController.createNotice(req, res, next)
);
router.get("/audit-logs", (req, res, next) => adminController.getAuditLogs(req, res, next));

const rejectOnboardingSchema = z
  .object({
    reason: z.string().trim().min(3, "Rejection reason must be at least 3 characters").max(255)
  })
  .strict();

router.get("/onboarding/pending", (req, res, next) => adminController.getPendingOnboardings(req, res, next));
router.post(
  "/onboarding/:id/approve",
  validateRequest({ params: idParamSchema }),
  (req, res, next) => adminController.approveOnboarding(req, res, next)
);
router.post(
  "/onboarding/:id/reject",
  validateRequest({ params: idParamSchema, body: rejectOnboardingSchema }),
  (req, res, next) => adminController.rejectOnboarding(req, res, next)
);

// Phase 2: Unit Household Inspection
const unitIdParamSchema = z
  .object({
    unitId: z.string().trim().min(1).max(64)
  })
  .strict();

router.get(
  "/units/:unitId/household",
  validateRequest({ params: unitIdParamSchema }),
  (req, res, next) => adminController.getUnitHousehold(req, res, next)
);

// Phase 3: Vehicles & Parking
router.get("/vehicles", (req, res, next) => adminController.getAllVehicles(req, res, next));
router.get("/parking", (req, res, next) => adminController.getAllParking(req, res, next));
router.get("/parking-slots", (req, res, next) => adminController.getAllParking(req, res, next));

const assignParkingSchema = z
  .object({
    unitId: z.string().trim().max(64).nullable()
  })
  .strict();

router.patch(
  "/parking/:id/assign",
  validateRequest({ params: idParamSchema, body: assignParkingSchema }),
  (req, res, next) => adminController.assignParkingSlot(req, res, next)
);

// Phase 5: Documents & Compliance Centre
const createDocumentSchema = z
  .object({
    propertyId: z.string().trim().max(64).optional(),
    title: z.string().trim().min(3, "Title must be at least 3 characters").max(255),
    description: z.string().trim().max(1000).optional(),
    category: z.enum(["APARTMENT_BYLAWS", "FIRE_SAFETY", "LIFT_AMC", "AGM_MINUTES", "FINANCIAL_AUDIT", "OTHER"]),
    fileUrl: z.string().trim().min(1).max(1024),
    fileSize: z.number().int().positive().max(20971520), // 20MB limit for docs
    mimeType: z.string().trim().max(100),
    accessLevel: z.enum(["ALL_RESIDENTS", "OWNERS_ONLY", "ADMIN_ONLY"]).optional()
  })
  .strict();

router.get("/documents", (req, res, next) => adminController.getDocuments(req, res, next));
router.post(
  "/documents",
  validateRequest({ body: createDocumentSchema }),
  (req, res, next) => adminController.createDocument(req, res, next)
);
router.delete(
  "/documents/:id",
  validateRequest({ params: idParamSchema }),
  (req, res, next) => adminController.deleteDocument(req, res, next)
);

// Phase 8: Operational Reports
router.get("/reports/operational", (req, res, next) => adminController.getOperationalReports(req, res, next));

export default router;
