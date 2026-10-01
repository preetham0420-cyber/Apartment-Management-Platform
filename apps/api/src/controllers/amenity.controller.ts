import { Request, Response, NextFunction } from "express";
import { amenityService } from "../services/amenity.service.js";
import { ApiSuccessResponse } from "@apartment/shared";

export class AmenityController {
  public async getAmenities(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await amenityService.getAmenities();
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

  public async getBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await amenityService.getBookings(req.user!);
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

  public async createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const amenityId = req.params.id as string;
      const { startTime, endTime } = req.body;
      const data = await amenityService.createBooking(req.user!, amenityId, startTime, endTime);
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

  public async cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookingId = req.params.id as string;
      const data = await amenityService.cancelBooking(req.user!, bookingId);
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

export const amenityController = new AmenityController();
