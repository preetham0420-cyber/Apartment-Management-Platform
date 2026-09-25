import { Request, Response } from "express";
import { ApiErrorResponse } from "@apartment/shared";

export function notFoundHandler(req: Request, res: Response): void {
  const errorResponse: ApiErrorResponse = {
    success: false,
    error: {
      code: "RESOURCE_NOT_FOUND",
      message: `The requested endpoint '${req.method} ${req.originalUrl}' does not exist.`
    },
    meta: {
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    }
  };
  res.status(404).json(errorResponse);
}
