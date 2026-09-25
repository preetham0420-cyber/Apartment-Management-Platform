import { Request, Response, NextFunction } from "express";
import { ApiErrorResponse } from "@apartment/shared";
import { config } from "../config/environment.js";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Safe server-side logging without leaking stack trace in production
  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err.message);

  const errorResponse: ApiErrorResponse = {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: config.nodeEnv === "production" ? "An internal server error occurred." : err.message
    },
    meta: {
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    }
  };

  res.status(500).json(errorResponse);
}
