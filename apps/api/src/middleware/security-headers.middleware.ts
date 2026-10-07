import { Request, Response, NextFunction } from "express";
import { config } from "../config/environment.js";

/**
 * Security Headers Middleware
 * Enforces defensive HTTP response headers without requiring external dependencies:
 * - Content-Security-Policy (CSP)
 * - X-Content-Type-Options: nosniff
 * - X-Frame-Options: DENY (anti-clickjacking)
 * - X-XSS-Protection: 0
 * - Referrer-Policy
 * - Strict-Transport-Security (HSTS in production)
 */
export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  // Prevent MIME-type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking by forbidding embedding in iframes
  res.setHeader("X-Frame-Options", "DENY");

  // Modern browser XSS hygiene
  res.setHeader("X-XSS-Protection", "0");

  // Restrict referrer leakage
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Content Security Policy
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self';"
  );

  // Cross-Origin Resource Policy (allows CORS-authorized clients across ports)
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

  // HSTS when in production
  if (config.nodeEnv === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  next();
}
