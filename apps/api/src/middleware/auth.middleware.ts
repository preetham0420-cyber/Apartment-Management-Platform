import { Request, Response, NextFunction } from "express";
import { TokenPayload, ProvisionalUserRole } from "@apartment/shared";
import { verifyToken } from "../utils/jwt.js";
import { AppError } from "../errors/app-error.js";

// Extend Express Request type to include authenticated user payload
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Authentication Middleware
 * Validates the Authorization Bearer JWT token on incoming requests.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(AppError.unauthorized("Authentication required. Please provide a valid Bearer token."));
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return next(AppError.unauthorized("Authentication token missing."));
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Role Authorization Middleware (Server-Side RBAC Guard)
 * Enforces server-side role check. Non-authorized roles receive HTTP 403 Forbidden.
 */
export function requireRole(...allowedRoles: ProvisionalUserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized("Authentication required before authorization check."));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        AppError.forbidden(
          `Access forbidden: Role '${req.user.role}' is not authorized to access this resource.`
        )
      );
    }

    next();
  };
}
