import { Request, Response, NextFunction } from "express";
import { duesService } from "../services/dues.service.js";
import { ApiSuccessResponse } from "@apartment/shared";

export class DuesController {
  public async getDues(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await duesService.getDues(req.user!);
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

  public async recordPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const paymentReference = req.body?.paymentReference;
      const data = await duesService.recordPayment(req.user!, id, paymentReference);
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

export const duesController = new DuesController();
