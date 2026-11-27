import { visitorRepository } from "../repositories/visitor.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { auditRepository } from "../repositories/audit.repository.js";
import { notificationRepository } from "../repositories/notification.repository.js";
import { TokenPayload, VisitorStatus, VisitorType, VisitorEntryType } from "@apartment/shared";
import { AppError } from "../errors/app-error.js";

export class VisitorService {
  public async getVisitors(
    user: TokenPayload,
    filters?: { status?: VisitorStatus; entryType?: VisitorEntryType }
  ) {
    if (user.role === "SUPER_ADMIN" || user.role === "SECURITY_GUARD") {
      return await visitorRepository.getAllVisitors(filters);
    }
    return await visitorRepository.getVisitorsByHost(user.userId);
  }

  public async getPendingApprovals(user: TokenPayload) {
    if (user.role === "SUPER_ADMIN" || user.role === "SECURITY_GUARD") {
      return await visitorRepository.getAllVisitors({ status: "PENDING" });
    }
    return await visitorRepository.getPendingApprovalsByHost(user.userId);
  }

  public async getVisitorById(user: TokenPayload, visitorId: string) {
    const visitor = await visitorRepository.getVisitorById(visitorId);
    if (!visitor) {
      throw AppError.notFound("Visitor pass not found.");
    }

    // Resident isolation: Residents can only view visitors for their own unit/host
    if (user.role !== "SUPER_ADMIN" && user.role !== "SECURITY_GUARD") {
      if (visitor.hostUserId !== user.userId) {
        throw AppError.forbidden("Access denied: You do not have permission to view this visitor.");
      }
    }

    return visitor;
  }

  public async createVisitor(
    user: TokenPayload,
    data: {
      visitorName: string;
      visitorPhone: string;
      purpose?: string;
      expectedArrival: string;
      visitorType?: VisitorType;
      vehicleNumber?: string;
      notes?: string;
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
      expectedArrival: data.expectedArrival,
      entryType: "PRE_APPROVED",
      visitorType: data.visitorType || "GUEST",
      vehicleNumber: data.vehicleNumber,
      notes: data.notes
    });

    await auditRepository.logAction({
      actorId: user.userId,
      actorEmail: user.email,
      action: "CREATE_PREAPPROVED_VISITOR",
      resourceType: "VISITOR",
      resourceId: visitor.id,
      details: {
        visitorName: visitor.visitorName,
        accessCode: visitor.accessCode,
        entryType: "PRE_APPROVED"
      }
    });

    return visitor;
  }

  public async createWalkInVisitor(
    user: TokenPayload,
    data: {
      unitId: string;
      visitorName: string;
      visitorPhone: string;
      purpose?: string;
      visitorType?: VisitorType;
      vehicleNumber?: string;
      notes?: string;
    }
  ) {
    // Only Security Guards and Super Admins can initiate walk-in entry requests at the gate
    if (user.role !== "SECURITY_GUARD" && user.role !== "SUPER_ADMIN") {
      throw AppError.forbidden("Only security guards can create walk-in entry requests.");
    }

    // Determine target host resident for the unit
    const primaryResident = await userRepository.getPrimaryResidentByUnitId(data.unitId);
    const hostUserId = primaryResident?.id || "user-resident-tenant-00000002";
    const hostName = primaryResident?.fullName || "Resident Host";

    const unitDetails = await userRepository.getUnitById(data.unitId);

    const visitor = await visitorRepository.createVisitor({
      unitId: data.unitId,
      unitNumber: unitDetails?.unitNumber || "402",
      block: unitDetails?.block || "Tower A",
      hostUserId,
      hostName,
      visitorName: data.visitorName,
      visitorPhone: data.visitorPhone,
      purpose: data.purpose || "VISITOR",
      expectedArrival: new Date().toISOString(),
      entryType: "WALK_IN",
      visitorType: data.visitorType || "GUEST",
      vehicleNumber: data.vehicleNumber,
      notes: data.notes
    });

    // Notify the host resident immediately of the walk-in approval request
    try {
      await notificationRepository.create({
        userId: hostUserId,
        title: "Gate Entry Approval Required",
        body: `Walk-in visitor ${visitor.visitorName} (${visitor.purpose}) is at Main Gate requesting entry to ${unitDetails?.block || 'Tower'} Flat ${unitDetails?.unitNumber || ''}.`,
        type: "VISITOR",
        referenceId: visitor.id
      });
    } catch {
      // In-memory or fallback notification handling
    }

    await auditRepository.logAction({
      actorId: user.userId,
      actorEmail: user.email,
      action: "CREATE_WALKIN_VISITOR_REQUEST",
      resourceType: "VISITOR",
      resourceId: visitor.id,
      details: {
        visitorName: visitor.visitorName,
        unitId: data.unitId,
        entryType: "WALK_IN",
        status: "PENDING"
      }
    });

    return visitor;
  }

  public async approveVisitor(user: TokenPayload, visitorId: string) {
    const visitor = await visitorRepository.getVisitorById(visitorId);
    if (!visitor) {
      throw AppError.notFound("Visitor request not found.");
    }

    // Authorization: Only the host resident or super admin can approve
    if (user.role !== "SUPER_ADMIN" && visitor.hostUserId !== user.userId) {
      throw AppError.forbidden("Access denied: Only the resident of the visited unit can approve entry.");
    }

    if (visitor.status !== "PENDING" && visitor.status !== "AT_GATE") {
      throw AppError.badRequest(`Cannot approve visitor with current status: ${visitor.status}`);
    }

    const updated = await visitorRepository.approveVisitor(visitorId, user.userId);

    await auditRepository.logAction({
      actorId: user.userId,
      actorEmail: user.email,
      action: "APPROVE_VISITOR_ENTRY",
      resourceType: "VISITOR",
      resourceId: visitorId,
      details: {
        visitorName: visitor.visitorName,
        oldStatus: visitor.status,
        newStatus: "APPROVED"
      }
    });

    return updated;
  }

  public async rejectVisitor(
    user: TokenPayload,
    visitorId: string,
    rejectionReason: string
  ) {
    const visitor = await visitorRepository.getVisitorById(visitorId);
    if (!visitor) {
      throw AppError.notFound("Visitor request not found.");
    }

    // Authorization: Only the host resident or super admin can reject
    if (user.role !== "SUPER_ADMIN" && visitor.hostUserId !== user.userId) {
      throw AppError.forbidden("Access denied: Only the resident of the visited unit can reject entry.");
    }

    if (visitor.status === "CHECKED_IN" || visitor.status === "CHECKED_OUT") {
      throw AppError.badRequest(`Cannot reject visitor who has already checked in or checked out.`);
    }

    const updated = await visitorRepository.rejectVisitor(
      visitorId,
      rejectionReason || "Entry declined by resident",
      user.userId
    );

    await auditRepository.logAction({
      actorId: user.userId,
      actorEmail: user.email,
      action: "REJECT_VISITOR_ENTRY",
      resourceType: "VISITOR",
      resourceId: visitorId,
      details: {
        visitorName: visitor.visitorName,
        rejectionReason,
        newStatus: "REJECTED"
      }
    });

    return updated;
  }

  public async updateVisitorStatus(
    user: TokenPayload,
    visitorId: string,
    newStatus: VisitorStatus
  ) {
    const visitor = await visitorRepository.getVisitorById(visitorId);
    if (!visitor) {
      throw AppError.notFound("Visitor pass not found.");
    }

    // 1. Ownership & Role Verification
    if (user.role !== "SUPER_ADMIN" && user.role !== "SECURITY_GUARD") {
      // Resident can only manage their own visitors
      if (visitor.hostUserId !== user.userId) {
        throw AppError.forbidden("Access denied: You do not own this visitor pass.");
      }
    }

    // 2. Strict State Transition Enforcement
    if (newStatus === "CHECKED_IN") {
      // Gate verification check: Cannot check in unapproved walk-in visitor!
      if (visitor.status === "PENDING") {
        throw AppError.forbidden(
          "Gate Entry Blocked: Walk-in visitor requires resident approval before check-in."
        );
      }
      if (visitor.status === "REJECTED") {
        throw AppError.forbidden("Gate Entry Blocked: This visitor entry was rejected.");
      }
    }

    if (newStatus === "CHECKED_OUT") {
      if (visitor.status !== "CHECKED_IN") {
        throw AppError.badRequest("Cannot check out a visitor who is not currently checked in.");
      }
    }

    if (newStatus === "CANCELLED") {
      if (visitor.status === "CHECKED_IN" || visitor.status === "CHECKED_OUT") {
        throw AppError.badRequest("Cannot cancel a visitor pass that has already entered premises.");
      }
    }

    const updated = await visitorRepository.updateVisitorStatus(visitorId, newStatus);

    await auditRepository.logAction({
      actorId: user.userId,
      actorEmail: user.email,
      action: "UPDATE_VISITOR_STATUS",
      resourceType: "VISITOR",
      resourceId: visitorId,
      details: { oldStatus: visitor.status, newStatus }
    });

    return updated;
  }
}

export const visitorService = new VisitorService();
