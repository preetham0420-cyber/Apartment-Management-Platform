import { Router } from "express";
import { z } from "zod";
import { residentController } from "../controllers/resident.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";

const router = Router();

// Protect all resident routes with authentication
router.use(authenticate);

const idParamSchema = z
  .object({
    id: z.string().trim().min(1).max(64)
  })
  .strict();

const updateProfileSchema = z
  .object({
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(150).optional(),
    phoneNumber: z.string().trim().min(5, "Phone number is too short").max(20).optional()
  })
  .strict();

const createHouseholdSchema = z
  .object({
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(150),
    relationship: z.string().trim().min(1, "Relationship is required").max(50),
    phoneNumber: z.string().trim().min(5).max(20).optional(),
    isEmergencyContact: z.boolean().optional()
  })
  .strict();

const updateHouseholdSchema = z
  .object({
    fullName: z.string().trim().min(2).max(150).optional(),
    relationship: z.string().trim().min(1).max(50).optional(),
    phoneNumber: z.string().trim().min(5).max(20).optional(),
    isEmergencyContact: z.boolean().optional()
  })
  .strict();

const createVehicleSchema = z
  .object({
    vehicleNumber: z.string().trim().min(3, "Vehicle number is required").max(30),
    vehicleType: z.enum(["TWO_WHEELER", "FOUR_WHEELER"]),
    makeModel: z.string().trim().max(100).optional(),
    parkingSlotId: z.string().trim().max(64).optional()
  })
  .strict();

const updateVehicleSchema = z
  .object({
    vehicleNumber: z.string().trim().min(3).max(30).optional(),
    vehicleType: z.enum(["TWO_WHEELER", "FOUR_WHEELER"]).optional(),
    makeModel: z.string().trim().max(100).optional(),
    parkingSlotId: z.string().trim().max(64).optional()
  })
  .strict();

// Profile
router.get("/home", (req, res, next) => residentController.getHome(req, res, next));
router.get("/profile", (req, res, next) => residentController.getProfile(req, res, next));
router.patch(
  "/profile",
  validateRequest({ body: updateProfileSchema }),
  (req, res, next) => residentController.updateProfile(req, res, next)
);

// Household Members (Phase 2)
router.get("/household", (req, res, next) => residentController.getHousehold(req, res, next));
router.post(
  "/household",
  validateRequest({ body: createHouseholdSchema }),
  (req, res, next) => residentController.addHousehold(req, res, next)
);
router.patch(
  "/household/:id",
  validateRequest({ params: idParamSchema, body: updateHouseholdSchema }),
  (req, res, next) => residentController.updateHousehold(req, res, next)
);
router.delete(
  "/household/:id",
  validateRequest({ params: idParamSchema }),
  (req, res, next) => residentController.deleteHousehold(req, res, next)
);

// Vehicles & Parking (Phase 3)
router.get("/vehicles", (req, res, next) => residentController.getVehicles(req, res, next));
router.post(
  "/vehicles",
  validateRequest({ body: createVehicleSchema }),
  (req, res, next) => residentController.addVehicle(req, res, next)
);
router.patch(
  "/vehicles/:id",
  validateRequest({ params: idParamSchema, body: updateVehicleSchema }),
  (req, res, next) => residentController.updateVehicle(req, res, next)
);
router.delete(
  "/vehicles/:id",
  validateRequest({ params: idParamSchema }),
  (req, res, next) => residentController.deleteVehicle(req, res, next)
);
router.get("/parking", (req, res, next) => residentController.getParking(req, res, next));

// Notifications (Phase 9)
router.get("/notifications", (req, res, next) => residentController.getNotifications(req, res, next));
router.patch(
  "/notifications/:id/read",
  validateRequest({ params: idParamSchema }),
  (req, res, next) => residentController.markNotificationRead(req, res, next)
);

// Community Services
router.get("/directory", (req, res, next) => residentController.getDirectory(req, res, next));
router.get("/lease", (req, res, next) => residentController.getLease(req, res, next));
router.get("/security", (req, res, next) => residentController.getSecurity(req, res, next));
router.get("/notices", (req, res, next) => residentController.getNotices(req, res, next));

export default router;
