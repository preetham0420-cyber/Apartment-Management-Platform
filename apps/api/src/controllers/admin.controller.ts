import { Request, Response, NextFunction } from "express";
import { ApiSuccessResponse } from "@apartment/shared";

export class AdminController {
  public getOverview(req: Request, res: Response, _next: NextFunction): void {
    const adminUser = req.user!;
    const response: ApiSuccessResponse<{
      authorizedAdmin: string;
      role: string;
      systemMetrics: {
        totalProperties: number;
        totalUnits: number;
        occupancyRate: string;
        collectionEfficiency: string;
        activeSecurityIncidents: number;
      };
      timestamp: string;
    }> = {
      success: true,
      data: {
        authorizedAdmin: adminUser.email,
        role: adminUser.role,
        systemMetrics: {
          totalProperties: 1,
          totalUnits: 120,
          occupancyRate: "81.6%",
          collectionEfficiency: "98.2%",
          activeSecurityIncidents: 0
        },
        timestamp: new Date().toISOString()
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: "0.1.0-alpha"
      }
    };
    res.status(200).json(response);
  }
}

export const adminController = new AdminController();
