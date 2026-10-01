import { Router } from "express";
import { z } from "zod";
import { amenityController } from "../controllers/amenity.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";

const router = Router();

router.use(authenticate);

const idParamSchema = z
  .object({
    id: z.string().trim().min(1).max(64)
  })
  .strict();

const createBookingSchema = z
  .object({
    startTime: z.string().datetime({ message: "Valid ISO start time is required" }),
    endTime: z.string().datetime({ message: "Valid ISO end time is required" })
  })
  .strict();

router.get("/amenities", (req, res, next) => amenityController.getAmenities(req, res, next));
router.get("/amenity-bookings", (req, res, next) => amenityController.getBookings(req, res, next));
router.post(
  "/amenities/:id/bookings",
  validateRequest({ params: idParamSchema, body: createBookingSchema }),
  (req, res, next) => amenityController.createBooking(req, res, next)
);
router.delete(
  "/bookings/:id",
  validateRequest({ params: idParamSchema }),
  (req, res, next) => amenityController.cancelBooking(req, res, next)
);

export default router;
