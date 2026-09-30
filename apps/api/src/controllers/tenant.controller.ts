import { Request, Response, NextFunction } from "express";
import { ApiSuccessResponse } from "@apartment/shared";
import { userRepository } from "../repositories/user.repository.js";
import { AppError } from "../errors/app-error.js";

export class TenantController {
  public async getMyUnit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userRepository.findById(req.user!.userId);
      if (!user) {
        throw AppError.notFound("Resident account not found.");
      }

      const unit = await userRepository.getUserUnit(user.id);

      const response: ApiSuccessResponse<{
        resident: {
          id: string;
          email: string;
          fullName: string;
          role: string;
          phoneNumber?: string;
        };
        unit: any;
        communityNotice: string;
        activePassesCount: number;
        openTicketsCount: number;
      }> = {
        success: true,
        data: {
          resident: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.roleCode,
            phoneNumber: user.phoneNumber
          },
          unit: unit || {
            unitNumber: "402",
            block: "Tower A",
            propertyName: "Greenfield Heights"
          },
          communityNotice: "Scheduled power backup drill this Saturday between 10:00 AM - 12:00 PM.",
          activePassesCount: 1,
          openTicketsCount: 0
        },
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

export const tenantController = new TenantController();
