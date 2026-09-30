import jwt, { SignOptions } from "jsonwebtoken";
import { TokenPayload } from "@apartment/shared";
import { jwtConfig } from "../config/jwt.js";
import { AppError } from "../errors/app-error.js";

/**
 * Sign a new JWT access token with user payload.
 */
export function signToken(payload: Omit<TokenPayload, "iat" | "exp">): string {
  const options: SignOptions = {
    expiresIn: "24h"
  };
  return jwt.sign(payload, jwtConfig.secret, options);
}

/**
 * Verify and decode an incoming JWT access token.
 */
export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, jwtConfig.secret) as TokenPayload;
  } catch (error) {
    const err = error as Error;
    if (err.name === "TokenExpiredError") {
      throw AppError.unauthorized("Authentication token has expired. Please log in again.");
    }
    throw AppError.unauthorized("Invalid authentication token.");
  }
}
