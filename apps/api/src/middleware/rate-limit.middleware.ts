import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up expired rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

/**
 * In-memory sliding window rate limiter for brute-force protection.
 * @param windowMs Time window in milliseconds (default 5 minutes)
 * @param maxAttempts Maximum requests allowed in the window (default 10)
 */
export function rateLimiter(
  windowMs: number = 5 * 60 * 1000,
  defaultMaxAttempts: number = process.env.NODE_ENV === "production" ? 10 : 200
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Derive client IP safely
    const clientIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown-client";

    // Use production limit of 10 if in production mode or if test requests production-equivalent rate limiting
    const effectiveLimit =
      req.headers["x-rate-limit-mode"] === "production" || process.env.NODE_ENV === "production"
        ? 10
        : defaultMaxAttempts;

    const key = `${req.baseUrl}${req.path}:${clientIp}`;
    const now = Date.now();
    const existing = rateLimitStore.get(key);

    if (!existing || now > existing.resetAt) {
      rateLimitStore.set(key, {
        count: 1,
        resetAt: now + windowMs
      });
      res.setHeader("X-RateLimit-Limit", effectiveLimit.toString());
      res.setHeader("X-RateLimit-Remaining", (effectiveLimit - 1).toString());
      return next();
    }

    if (existing.count >= effectiveLimit) {
      const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfterSeconds.toString());
      res.setHeader("X-RateLimit-Limit", effectiveLimit.toString());
      res.setHeader("X-RateLimit-Remaining", "0");
      return next(
        new AppError(
          `Too many attempts from this IP address. Please try again in ${retryAfterSeconds} seconds.`,
          429,
          "RATE_LIMIT_EXCEEDED"
        )
      );
    }

    existing.count += 1;
    res.setHeader("X-RateLimit-Limit", effectiveLimit.toString());
    res.setHeader("X-RateLimit-Remaining", Math.max(0, effectiveLimit - existing.count).toString());
    next();
  };
}

/**
 * Reset rate limit for a client IP after successful authentication.
 */
export function resetRateLimit(path: string, ip: string): void {
  const key = `${path}:${ip}`;
  rateLimitStore.delete(key);
}
