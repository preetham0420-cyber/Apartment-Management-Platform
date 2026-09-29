import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";

/**
 * 404 Not Found Middleware
 * Hands off an AppError.notFound to the central errorHandler.
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(AppError.notFound(`Endpoint not found: ${req.method} ${req.originalUrl}`));
}
