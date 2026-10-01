import { Request, Response, NextFunction } from "express";
import { ApiSuccessResponse, LoginResponseData, AuthUser } from "@apartment/shared";
import { authService } from "../services/auth.service.js";

export class AuthController {
  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      const response: ApiSuccessResponse<LoginResponseData> = {
        success: true,
        data: result,
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

  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      const response: ApiSuccessResponse<typeof result> = {
        success: true,
        data: result,
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

  public async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.getCurrentUser(req.user!.userId);
      const response: ApiSuccessResponse<{ user: AuthUser; unit?: any }> = {
        success: true,
        data: result,
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

  public logout(req: Request, res: Response, next: NextFunction): void {
    try {
      const response: ApiSuccessResponse<{ message: string; sessionTerminated: boolean }> = {
        success: true,
        data: {
          message: "Session terminated successfully.",
          sessionTerminated: true
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

  public refresh(req: Request, res: Response, next: NextFunction): void {
    try {
      const result = authService.refreshToken(req.user!);
      const response: ApiSuccessResponse<{ token: string }> = {
        success: true,
        data: result,
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

export const authController = new AuthController();
