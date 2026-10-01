import { maintenanceRepository } from "../repositories/maintenance.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { auditRepository } from "../repositories/audit.repository.js";
import {
  TokenPayload,
  MaintenanceCategory,
  MaintenancePriority,
  MaintenanceStatus
} from "@apartment/shared";
import { AppError } from "../errors/app-error.js";

export class MaintenanceService {
  public async getMaintenance(user: TokenPayload) {
    if (user.role === "SUPER_ADMIN" || user.role === "MAINTENANCE_STAFF") {
      return await maintenanceRepository.getAll();
    }
    return await maintenanceRepository.getByResident(user.userId);
  }

  public async createMaintenance(
    user: TokenPayload,
    data: {
      category: MaintenanceCategory;
      title: string;
      description: string;
      priority?: MaintenancePriority;
      attachments?: { fileName: string; fileUrl: string; fileSize: number; mimeType: string }[];
    }
  ) {
    const userUnit = await userRepository.getUserUnit(user.userId);
    const unitId = userUnit?.id || "u1111111-2222-3333-4444-555555555551";

    const dbUser = await userRepository.findById(user.userId);

    const request = await maintenanceRepository.create({
      unitId,
      unitNumber: userUnit?.unitNumber || "402",
      block: userUnit?.block || "Tower A",
      residentId: user.userId,
      residentName: dbUser?.fullName || user.email,
      category: data.category,
      title: data.title,
      description: data.description,
      priority: data.priority,
      attachments: data.attachments
    });

    await auditRepository.logAction({
      actorId: user.userId,
      actorEmail: user.email,
      action: "CREATE_MAINTENANCE_REQUEST",
      resourceType: "MAINTENANCE",
      resourceId: request.id,
      details: { title: request.title, category: request.category, attachmentCount: (data.attachments || []).length }
    });

    return request;
  }

  public async updateMaintenance(
    user: TokenPayload,
    id: string,
    updates: {
      status?: MaintenanceStatus;
      priority?: MaintenancePriority;
      assignedToUserId?: string;
    }
  ) {
    const existing = await maintenanceRepository.getById(id);
    if (!existing) {
      throw AppError.notFound("Maintenance request not found.");
    }

    // Server-side ownership check
    if (user.role !== "SUPER_ADMIN" && user.role !== "MAINTENANCE_STAFF") {
      if (existing.residentId !== user.userId) {
        throw AppError.forbidden("Access denied: You do not own this maintenance ticket.");
      }
      // Residents can only cancel their own request
      if (updates.status && updates.status !== "CANCELLED") {
        throw AppError.forbidden("Residents are only permitted to cancel their requests.");
      }
    }

    const updated = await maintenanceRepository.update(id, updates);

    await auditRepository.logAction({
      actorId: user.userId,
      actorEmail: user.email,
      action: "UPDATE_MAINTENANCE_REQUEST",
      resourceType: "MAINTENANCE",
      resourceId: id,
      details: updates
    });

    return updated;
  }

  public async addComment(user: TokenPayload, requestId: string, comment: string) {
    const existing = await maintenanceRepository.getById(requestId);
    if (!existing) {
      throw AppError.notFound("Maintenance request not found.");
    }

    // Ownership check
    if (user.role !== "SUPER_ADMIN" && user.role !== "MAINTENANCE_STAFF") {
      if (existing.residentId !== user.userId) {
        throw AppError.forbidden("Access denied: You do not own this maintenance ticket.");
      }
    }

    const dbUser = await userRepository.findById(user.userId);
    const commentRecord = await maintenanceRepository.addComment(
      requestId,
      user.userId,
      dbUser?.fullName || user.email,
      user.role,
      comment
    );

    await auditRepository.logAction({
      actorId: user.userId,
      actorEmail: user.email,
      action: "ADD_MAINTENANCE_COMMENT",
      resourceType: "MAINTENANCE",
      resourceId: requestId,
      details: { commentId: commentRecord.id }
    });

    return commentRecord;
  }
}

export const maintenanceService = new MaintenanceService();
