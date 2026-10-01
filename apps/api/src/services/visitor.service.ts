import { visitorRepository } from "../repositories/visitor.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { auditRepository } from "../repositories/audit.repository.js";
import { TokenPayload, VisitorStatus } from "@apartment/shared";
import { AppError } from "../errors/app-error.js";

export class VisitorService {
  public async getVisitors(user: TokenPayload) {
    if (user.role === "SUPER_ADMIN" || user.role === "SECURITY_GUARD") {
      return await visitorRepository.getAllVisitors();
    }
    return await visitorRepository.getVisitorsByHost(user.userId);
  }

  public async createVisitor(
    user: TokenPayload,
    data: {
      visitorName: string;
      visitorPhone: string;
      purpose?: string;
      expectedArrival: string;
    }
  ) {
    const userUnit = await userRepository.getUserUnit(user.userId);
    const unitId = userUnit?.id || "u1111111-2222-3333-4444-555555555551";

    const dbUser = await userRepository.findById(user.userId);

    const visitor = await visitorRepository.createVisitor({
      unitId,
      unitNumber: userUnit?.unitNumber || "402",
      block: userUnit?.block || "Tower A",
      hostUserId: user.userId,
      hostName: dbUser?.fullName || user.email,
      visitorName: data.visitorName,
      visitorPhone: data.visitorPhone,
      purpose: data.purpose || "GUEST",
      expectedArrival: data.expectedArrival
    });

    await auditRepository.logAction({
      actorId: user.userId,
      actorEmail: user.email,
      action: "CREATE_VISITOR_PASS",
      resourceType: "VISITOR",
      resourceId: visitor.id,
      details: { visitorName: visitor.visitorName, accessCode: visitor.accessCode }
    });

    return visitor;
  }

  public async updateVisitorStatus(
    user: TokenPayload,
    visitorId: string,
    status: VisitorStatus
  ) {
    const visitor = await visitorRepository.getVisitorById(visitorId);
    if (!visitor) {
      throw AppError.notFound("Visitor pass not found.");
    }

    // Ownership check: If resident, they can only update passes they created
    if (user.role !== "SUPER_ADMIN" && user.role !== "SECURITY_GUARD") {
      if (visitor.hostUserId !== user.userId) {
        throw AppError.forbidden("Access denied: You do not own this visitor pass.");
      }
    }

    const updated = await visitorRepository.updateVisitorStatus(visitorId, status);

    await auditRepository.logAction({
      actorId: user.userId,
      actorEmail: user.email,
      action: "UPDATE_VISITOR_STATUS",
      resourceType: "VISITOR",
      resourceId: visitorId,
      details: { oldStatus: visitor.status, newStatus: status }
    });

    return updated;
  }
}

export const visitorService = new VisitorService();
