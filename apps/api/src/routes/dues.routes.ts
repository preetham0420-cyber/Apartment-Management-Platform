import { Router } from "express";
import { z } from "zod";
import { duesController } from "../controllers/dues.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";

const router = Router();

router.use(authenticate);

const idParamSchema = z
  .object({
    id: z.string().trim().min(1).max(64)
  })
  .strict();

const recordPaymentSchema = z
  .object({
    paymentReference: z.string().trim().max(100).optional()
  })
  .strict();

router.get("/", (req, res, next) => duesController.getDues(req, res, next));
router.post(
  "/:id/record-payment",
  validateRequest({ params: idParamSchema, body: recordPaymentSchema }),
  (req, res, next) => duesController.recordPayment(req, res, next)
);

export default router;
