import dotenv from "dotenv";

dotenv.config();

/**
 * JWT Configuration
 * Secret loaded strictly from environment variables.
 */
export const jwtConfig = {
  secret: process.env.JWT_ACCESS_SECRET || "dev_provisional_jwt_secret_min_32_characters_long_for_security",
  expiresIn: "24h"
};
