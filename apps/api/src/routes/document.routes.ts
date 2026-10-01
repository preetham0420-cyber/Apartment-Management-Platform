import { Router } from "express";
import { documentRepository } from "../repositories/document.repository.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { ApiSuccessResponse } from "@apartment/shared";

const router = Router();

// Authenticated users can list documents based on their authorization level
router.get("/documents", authenticate, async (req, res, next) => {
  try {
    const userRole = req.user!.role;
    const documents = await documentRepository.getByRole(userRole);
    const response: ApiSuccessResponse<typeof documents> = {
      success: true,
      data: documents,
      meta: {
        timestamp: new Date().toISOString(),
        version: "0.1.0-alpha"
      }
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
