import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { TokenPayload } from "@apartment/shared";
import { jwtConfig } from "../config/jwt.js";
import { AppError } from "../errors/app-error.js";

/**
 * Sign a new JWT access token with user payload.
 * Strictly forces HMAC SHA-256 algorithm.
 */
export function signToken(payload: Omit<TokenPayload, "iat" | "exp">): string {
  const options: SignOptions = {
    algorithm: "HS256",
    expiresIn: "24h"
  };
  return jwt.sign(payload, jwtConfig.secret, options);
}

/**
 * Verify and decode an incoming JWT access token.
 * Strictly enforces algorithm whitelist to prevent algorithm confusion attacks (e.g. 'none' or asymmetric key injection).
 */
export function verifyToken(token: string): TokenPayload {
  try {
    const options: VerifyOptions = {
      algorithms: ["HS256"]
    };
    return jwt.verify(token, jwtConfig.secret, options) as TokenPayload;
  } catch (error) {
    const err = error as Error;
    if (err.name === "TokenExpiredError") {
      throw AppError.unauthorized("Authentication token has expired. Please log in again.");
    }
    throw AppError.unauthorized("Invalid authentication token.");
  }
}
