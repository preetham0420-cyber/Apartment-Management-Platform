import { Router } from "express";
import { z } from "zod";
import { authController } from "../controllers/auth.controller.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { rateLimiter } from "../middleware/rate-limit.middleware.js";

const router = Router();

// Strict Zod schema rejecting extraneous / unexpected properties
const loginSchema = z
  .object({
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .toLowerCase()
      .email("Please provide a valid email address")
      .max(255, "Email address is too long"),
    password: z
      .string({ required_error: "Password is required" })
      .min(1, "Password is required")
      .max(128, "Password must not exceed 128 characters")
  })
  .strict();

const registerSchema = z
  .object({
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .toLowerCase()
      .email("Please provide a valid email address")
      .max(255),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .max(128),
    fullName: z
      .string({ required_error: "Full name is required" })
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(150),
    phoneNumber: z.string().trim().min(5).max(20).optional(),
    unitId: z.string({ required_error: "Unit ID is required" }).trim().min(1),
    role: z.enum(["RESIDENT_TENANT", "RESIDENT_OWNER"], {
      required_error: "Role must be either RESIDENT_TENANT or RESIDENT_OWNER"
    })
  })
  .strict();

// Rate-limited and validated login endpoint (max 10 in prod, 100 in dev per 5 mins per IP)
router.post(
  "/login",
  rateLimiter(),
  validateRequest({ body: loginSchema }),
  (req, res, next) => authController.login(req, res, next)
);

// Rate-limited resident onboarding registration endpoint
router.post(
  "/register",
  rateLimiter(),
  validateRequest({ body: registerSchema }),
  (req, res, next) => authController.register(req, res, next)
);

// Protected identity verification endpoint
router.get(
  "/me",
  authenticate,
  (req, res, next) => authController.getMe(req, res, next)
);

// Token refresh endpoint
router.post(
  "/refresh",
  authenticate,
  (req, res, next) => authController.refresh(req, res, next)
);

// Session termination endpoint
router.post(
  "/logout",
  authenticate,
  (req, res, next) => authController.logout(req, res, next)
);

export default router;
