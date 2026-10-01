import { Request, Response, NextFunction } from "express";
import { maintenanceService } from "../services/maintenance.service.js";
import { maintenanceRepository } from "../repositories/maintenance.repository.js";
import { ApiSuccessResponse } from "@apartment/shared";
import crypto from "crypto";
import fs from "fs";
import path from "path";

export class MaintenanceController {
  public async getMaintenance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await maintenanceService.getMaintenance(req.user!);
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

  public async createMaintenance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await maintenanceService.createMaintenance(req.user!, req.body);
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

  public async updateMaintenance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const data = await maintenanceService.updateMaintenance(req.user!, id, req.body);
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

  public async addComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const data = await maintenanceService.addComment(req.user!, id, req.body.comment);
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

  public async uploadAttachment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let buffer: Buffer | null = null;
      let originalName = "attachment";
      let clientMime = "";

      if (req.file) {
        buffer = req.file.buffer;
        originalName = req.file.originalname || "attachment";
        clientMime = req.file.mimetype || "";
      } else if (req.body && req.body.fileData) {
        try {
          buffer = Buffer.from(req.body.fileData, "base64");
          originalName = req.body.fileName || "attachment";
          clientMime = req.body.mimeType || "";
        } catch {
          res.status(400).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: "Invalid base64 encoded file data." }
          });
          return;
        }
      }

      if (!buffer || buffer.length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "No file was uploaded."
          }
        });
        return;
      }

      // Check max size (5 MB)
      if (buffer.length > 5 * 1024 * 1024) {
        res.status(400).json({
          success: false,
          error: {
            code: "FILE_TOO_LARGE",
            message: "Attachment exceeds the maximum allowed size of 5 MB."
          }
        });
        return;
      }

      // Reject non-whitelisted client declared MIME
      const allowedMimes = ["image/jpeg", "image/png", "application/pdf"];
      if (clientMime && !allowedMimes.includes(clientMime)) {
        res.status(400).json({
          success: false,
          error: {
            code: "INVALID_FILE_TYPE",
            message: "Security violation: Only image/jpeg, image/png, and application/pdf are permitted."
          }
        });
        return;
      }

      // Strict magic-byte / file signature check
      let verifiedMime: string | null = null;
      let extension = "";

      if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        verifiedMime = "image/jpeg";
        extension = ".jpg";
      } else if (
        buffer.length >= 8 &&
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a
      ) {
        verifiedMime = "image/png";
        extension = ".png";
      } else if (
        buffer.length >= 4 &&
        buffer[0] === 0x25 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x44 &&
        buffer[3] === 0x46
      ) {
        verifiedMime = "application/pdf";
        extension = ".pdf";
      }

      if (!verifiedMime || (clientMime && clientMime !== verifiedMime)) {
        res.status(400).json({
          success: false,
          error: {
            code: "INVALID_FILE_SIGNATURE",
            message: "Security violation: File header signature does not match allowed types (JPEG, PNG, PDF)."
          }
        });
        return;
      }

      const safeRandomName = `maint-${crypto.randomUUID()}${extension}`;
      const uploadDir = path.resolve(process.cwd(), "uploads", "maintenance");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const safeFilePath = path.join(uploadDir, safeRandomName);
      fs.writeFileSync(safeFilePath, buffer);

      // Clean client filename from path traversals
      const sanitizedOriginalName = path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, "_");

      const fileData = {
        fileName: sanitizedOriginalName,
        fileUrl: `/uploads/maintenance/${safeRandomName}`,
        fileSize: buffer.length,
        mimeType: verifiedMime
      };

      const ticketId = req.params.id ? String(req.params.id) : undefined;
      if (ticketId) {
        const attachedRecord = await maintenanceRepository.addAttachment(ticketId, fileData);
        res.status(201).json({
          success: true,
          data: attachedRecord,
          meta: {
            timestamp: new Date().toISOString(),
            version: "0.1.0-alpha"
          }
        });
        return;
      }

      const response: ApiSuccessResponse<typeof fileData> = {
        success: true,
        data: fileData,
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
}

export const maintenanceController = new MaintenanceController();
