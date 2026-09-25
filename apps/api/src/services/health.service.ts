import { HealthCheckData } from "@apartment/shared";
import { config } from "../config/environment.js";

export class HealthService {
  private startTime: number = Date.now();

  public getHealth(): HealthCheckData {
    return {
      service: config.appName,
      status: "healthy",
      version: config.version,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv
    };
  }
}

export const healthService = new HealthService();
