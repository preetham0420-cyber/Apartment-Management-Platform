import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  appName: process.env.APP_NAME || "Apartment Management Platform API",
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:8081").split(","),
  version: "0.1.0-alpha"
};
