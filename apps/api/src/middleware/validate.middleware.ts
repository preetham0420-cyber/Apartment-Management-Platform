import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { AppError } from "../errors/app-error.js";
import { ApiErrorDetail } from "@apartment/shared";

export interface RequestValidationSchema {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}

/**
 * Express middleware that validates incoming requests against Zod schemas.
 * Sanitizes and attaches parsed schemas to req.body, req.query, or req.params.
 * Formats validation failures into standard ApiErrorDetail objects without echoing sensitive inputs.
 */
export function validateRequest(schemas: RequestValidationSchema) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.params) {
        req.params = (await schemas.params.parseAsync(req.params)) as Record<string, string>;
      }
      if (schemas.query) {
        req.query = (await schemas.query.parseAsync(req.query)) as Record<string, string>;
      }
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details: ApiErrorDetail[] = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code
        }));
        next(new AppError("Request validation failed", 400, "VALIDATION_ERROR", details));
      } else {
        next(error);
      }
    }
  };
}
