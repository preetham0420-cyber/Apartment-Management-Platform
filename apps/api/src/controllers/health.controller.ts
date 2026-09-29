import { Request, Response, NextFunction } from "express";
import { ApiSuccessResponse, HealthCheckData } from "@apartment/shared";
import { healthService } from "../services/health.service.js";

export class HealthController {
  public check(_req: Request, res: Response, next: NextFunction): void {
    try {
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
    } catch (error) {
      next(error);
    }
  }
}

export const healthController = new HealthController();
