import { Router } from "express";
import { z } from "zod";
import { authController } from "../controllers/auth.controller.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required")
});

// Public Login Endpoint
router.post(
  "/login",
  validateRequest({ body: loginSchema }),
  (req, res, next) => authController.login(req, res, next)
);

// Protected Identity Verification Endpoint
router.get(
  "/me",
  authenticate,
  (req, res, next) => authController.getMe(req, res, next)
);

export default router;
