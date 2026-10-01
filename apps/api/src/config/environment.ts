import dotenv from "dotenv";

dotenv.config();

const rawCors = process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:8081,http://172.20.10.2:3000,http://172.20.10.2:8081";

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  appName: process.env.APP_NAME || "Apartment Management Platform API",
  corsOrigins: rawCors
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean),
  version: "0.1.0-alpha"
};
