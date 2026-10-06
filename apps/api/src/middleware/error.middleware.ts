import { Request, Response, NextFunction } from "express";
import { ApiErrorResponse, ApiErrorDetail } from "@apartment/shared";
import { AppError } from "../errors/app-error.js";
import { config } from "../config/environment.js";
import { ZodError } from "zod";

/**
 * Central Express Error-Handling Middleware
 * - Intercepts AppError, ZodError, and unhandled system errors
 * - Sanitizes client responses to prevent internal stack trace or credential leakage
 * - Logs errors safely on the server side
 */
export function errorHandler(
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = 500;
  let errorCode = "INTERNAL_SERVER_ERROR";
  let message = "An internal server error occurred.";
  let details: ApiErrorDetail[] | undefined = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    errorCode = "VALIDATION_ERROR";
    message = "Request validation failed";
    details = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
      code: e.code
    }));
  } else if ((err as any).name === "MulterError" || (err as any).code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    errorCode = "FILE_TOO_LARGE";
    message = (err as any).code === "LIMIT_FILE_SIZE"
      ? "Attachment exceeds the maximum allowed size of 5 MB."
      : err.message || "File upload validation error";
  } else if (config.nodeEnv !== "production") {
    message = err.message;
  }

  // Safe server-side telemetry: never print passwords, tokens, or sensitive payload data
  if (statusCode >= 500) {
    console.error(`[API Server Error] [${errorCode}] ${req.method} ${req.originalUrl}:`, err.message);
  } else {
    console.warn(`[API Client Error] [${errorCode}] ${req.method} ${req.originalUrl}:`, message);
  }

  const errorResponse: ApiErrorResponse = {
    success: false,
    error: {
      code: errorCode,
      message,
      ...(details && details.length > 0 ? { details } : {})
    },
    meta: {
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    }
  };

  res.status(statusCode).json(errorResponse);
}
