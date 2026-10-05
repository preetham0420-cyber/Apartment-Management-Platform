import { Request, Response, NextFunction } from "express";
import { residentService } from "../services/resident.service.js";
import { ApiSuccessResponse } from "@apartment/shared";

export class ResidentController {
  public async getHome(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await residentService.getResidentHome(req.user!.userId);
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

  public async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await residentService.getResidentProfile(req.user!.userId);
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

  public async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await residentService.updateResidentProfile(req.user!.userId, req.body);
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

  // Household Members
  public async getHousehold(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await residentService.getHouseholdMembers(req.user!.userId);
      const response: ApiSuccessResponse<typeof data> = {
        success: true,
        data,
        meta: { timestamp: new Date().toISOString(), version: "0.1.0-alpha" }
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  public async addHousehold(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await residentService.addHouseholdMember(req.user!.userId, req.body);
      const response: ApiSuccessResponse<typeof data> = {
        success: true,
        data,
        meta: { timestamp: new Date().toISOString(), version: "0.1.0-alpha" }
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  public async updateHousehold(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await residentService.updateHouseholdMember(req.user!.userId, String(req.params.id), req.body);
      const response: ApiSuccessResponse<typeof data> = {
        success: true,
        data,
        meta: { timestamp: new Date().toISOString(), version: "0.1.0-alpha" }
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  public async deleteHousehold(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await residentService.deleteHouseholdMember(req.user!.userId, String(req.params.id));
      const response: ApiSuccessResponse<typeof data> = {
        success: true,
        data,
        meta: { timestamp: new Date().toISOString(), version: "0.1.0-alpha" }
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Vehicles & Parking
  public async getVehicles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await residentService.getVehicles(req.user!.userId);
      const response: ApiSuccessResponse<typeof data> = {
        success: true,
        data,
        meta: { timestamp: new Date().toISOString(), version: "0.1.0-alpha" }
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  public async addVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await residentService.addVehicle(req.user!.userId, req.body);
      const response: ApiSuccessResponse<typeof data> = {
        success: true,
        data,
        meta: { timestamp: new Date().toISOString(), version: "0.1.0-alpha" }
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  public async updateVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await residentService.updateVehicle(req.user!.userId, String(req.params.id), req.body);
      const response: ApiSuccessResponse<typeof data> = {
        success: true,
        data,
        meta: { timestamp: new Date().toISOString(), version: "0.1.0-alpha" }
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  public async deleteVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await residentService.deleteVehicle(req.user!.userId, String(req.params.id));
      const response: ApiSuccessResponse<typeof data> = {
        success: true,
        data,
        meta: { timestamp: new Date().toISOString(), version: "0.1.0-alpha" }
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  public async getParking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await residentService.getAssignedParking(req.user!.userId);
      const response: ApiSuccessResponse<typeof data> = {
        success: true,
        data,
        meta: { timestamp: new Date().toISOString(), version: "0.1.0-alpha" }
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Notifications
  public async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await residentService.getNotifications(req.user!.userId);
      const response: ApiSuccessResponse<typeof data> = {
        success: true,
        data,
        meta: { timestamp: new Date().toISOString(), version: "0.1.0-alpha" }
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  public async markNotificationRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await residentService.markNotificationAsRead(req.user!.userId, String(req.params.id));
      const response: ApiSuccessResponse<typeof data> = {
        success: true,
        data,
        meta: { timestamp: new Date().toISOString(), version: "0.1.0-alpha" }
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  public async getDirectory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await residentService.getResidentsDirectory(req.user!.userId);
      const response: ApiSuccessResponse<typeof data> = {
        success: true,
        data,
        meta: { timestamp: new Date().toISOString(), version: "0.1.0-alpha" }
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  public async getLease(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await residentService.getResidentLease(req.user!.userId);
      const response: ApiSuccessResponse<typeof data> = {
        success: true,
        data,
        meta: { timestamp: new Date().toISOString(), version: "0.1.0-alpha" }
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  public async getSecurity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await residentService.getSecurityDesk();
      const response: ApiSuccessResponse<typeof data> = {
        success: true,
        data,
        meta: { timestamp: new Date().toISOString(), version: "0.1.0-alpha" }
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  public async getNotices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await residentService.getResidentNotices();
      const response: ApiSuccessResponse<typeof data> = {
        success: true,
        data,
        meta: { timestamp: new Date().toISOString(), version: "0.1.0-alpha" }
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}


export const residentController = new ResidentController();
