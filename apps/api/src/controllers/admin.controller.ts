import { Request, Response, NextFunction } from "express";
import { adminService } from "../services/admin.service.js";
import { ApiSuccessResponse } from "@apartment/shared";

export class AdminController {
  public async getDashboard(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminService.getDashboard();
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

  public getOverview(req: Request, res: Response, next: NextFunction): void {
    this.getDashboard(req, res, next);
  }

  public async getResidents(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminService.getResidents();
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

  public async updateResidentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const residentId = req.params.id as string;
      const { isActive } = req.body;
      const data = await adminService.updateResidentStatus(req.user!, residentId, isActive);
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

  public async getAllMaintenance(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminService.getAllMaintenance();
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

  public async getProperties(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminService.getProperties();
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

  public async updateProperty(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const propertyId = req.params.id as string;
      const data = await adminService.updatePropertyConfig(req.user!, propertyId, req.body);
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

  public async getUnits(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminService.getUnits();
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

  public async updateUnitStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const unitId = req.params.id as string;
      const { status } = req.body;
      const data = await adminService.updateUnitStatus(req.user!, unitId, status);
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

  public async getAllVisitors(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminService.getAllVisitors();
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

  public async getAllDues(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminService.getAllDues();
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

  public async getAllAmenities(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminService.getAllAmenities();
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

  public async getAllBookings(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminService.getAllBookings();
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

  public async cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookingId = req.params.id as string;
      const data = await adminService.cancelBooking(req.user!, bookingId);
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

  public async getAllNotices(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminService.getAllNotices();
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

  public async createNotice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminService.createNotice(req.user!, req.body);
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

  public async getAuditLogs(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminService.getAuditLogs();
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

  public async getPendingOnboardings(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminService.getPendingOnboardings();
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

  public async approveOnboarding(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignmentId = req.params.id as string;
      const data = await adminService.approveOnboarding(req.user!, assignmentId);
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

  public async rejectOnboarding(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignmentId = req.params.id as string;
      const { reason } = req.body;
      const data = await adminService.rejectOnboarding(req.user!, assignmentId, reason || "Application rejected by administration.");
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

  // Phase 2: Unit Household
  public async getUnitHousehold(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const unitId = req.params.unitId as string;
      const data = await adminService.getUnitHousehold(unitId);
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

  // Phase 3: Vehicles & Parking
  public async getAllVehicles(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminService.getAllVehicles();
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

  public async getAllParking(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminService.getAllParkingSlots();
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

  public async assignParkingSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slotId = req.params.id as string;
      const { unitId } = req.body;
      const data = await adminService.assignParkingSlot(req.user!, slotId, unitId ?? null);
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

  // Phase 5: Documents
  public async getDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminService.getDocuments(req.user!.role);
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

  public async createDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminService.createDocument(req.user!, req.body);
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

  public async deleteDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const documentId = req.params.id as string;
      const data = await adminService.deleteDocument(req.user!, documentId);
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

  // Phase 8: Operational Reports
  public async getOperationalReports(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminService.getOperationalReports();
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

export const adminController = new AdminController();
