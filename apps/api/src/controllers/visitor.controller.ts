import { Request, Response, NextFunction } from "express";
import { visitorService } from "../services/visitor.service.js";
import { ApiSuccessResponse } from "@apartment/shared";

export class VisitorController {
  public async getVisitors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await visitorService.getVisitors(req.user!);
      const response: ApiSuccessResponse<typeof data> = {
        success: true,
        data,
        meta: {
          timestamp: new Date().toISOString(),
          version: "0.1.0-alpha"
        }
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  public async createVisitor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await visitorService.createVisitor(req.user!, req.body);
      const response: ApiSuccessResponse<typeof data> = {
        success: true,
        data,
        meta: {
          timestamp: new Date().toISOString(),
          version: "0.1.0-alpha"
        }
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  public async updateVisitorStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const visitorId = req.params.id as string;
      const data = await visitorService.updateVisitorStatus(req.user!, visitorId, req.body.status);
      const response: ApiSuccessResponse<typeof data> = {
        success: true,
        data,
        meta: {
          timestamp: new Date().toISOString(),
          version: "0.1.0-alpha"
        }
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const visitorController = new VisitorController();
