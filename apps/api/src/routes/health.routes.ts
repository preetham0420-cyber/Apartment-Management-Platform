import { Router } from "express";
import { healthController } from "../controllers/health.controller.js";

const router = Router();

router.get("/health", (req, res, next) => healthController.check(req, res, next));

export default router;
