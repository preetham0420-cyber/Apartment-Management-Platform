import { Request, Response } from "express";
import { ApiSuccessResponse, HealthCheckData } from "@apartment/shared";
import { healthService } from "../services/health.service.js";

export class HealthController {
  public check(_req: Request, res: Response): void {
    const health = healthService.getHealth();
    const response: ApiSuccessResponse<HealthCheckData> = {
      success: true,
      data: health,
      meta: {
        timestamp: new Date().toISOString(),
        version: health.version
      }
    };
    res.status(200).json(response);
  }
}

export const healthController = new HealthController();
