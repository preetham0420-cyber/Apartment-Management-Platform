import { userRepository } from "../repositories/user.repository.js";
import { noticeRepository } from "../repositories/notice.repository.js";
import { visitorRepository } from "../repositories/visitor.repository.js";
import { maintenanceRepository } from "../repositories/maintenance.repository.js";
import { duesRepository } from "../repositories/dues.repository.js";
import { householdRepository } from "../repositories/household.repository.js";
import { vehicleRepository } from "../repositories/vehicle.repository.js";
import { notificationRepository } from "../repositories/notification.repository.js";
import { VehicleType } from "@apartment/shared";
import { AppError } from "../errors/app-error.js";

export class ResidentService {
  /**
   * Aggregate home dashboard data for resident.
   * Server-side verified: fetches exclusively the resident's authorized data.
   */
  public async getResidentHome(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound("Resident account not found.");
    }

    const unit = await userRepository.getUserUnit(user.id);
    const notices = await noticeRepository.getRecentNotices(3);
    const visitors = await visitorRepository.getVisitorsByHost(user.id);
    const maintenance = await maintenanceRepository.getByResident(user.id);
    const dues = await duesRepository.getByResident(user.id);

    const activeVisitors = visitors.filter((v) => v.status === "PRE_APPROVED" || v.status === "AT_GATE");
    const openMaintenance = maintenance.filter((m) => m.status !== "RESOLVED" && m.status !== "CLOSED" && m.status !== "CANCELLED");
    const pendingDues = dues.filter((d) => d.status === "PENDING" || d.status === "OVERDUE");
    const totalDueAmount = pendingDues.reduce((sum, d) => sum + d.amount, 0);

    return {
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
      metrics: {
        currentDue: totalDueAmount,
        openRequestsCount: openMaintenance.length,
        expectedGuestsCount: activeVisitors.length
      },
      notices,
      recentVisitors: visitors.slice(0, 3),
      recentMaintenance: maintenance.slice(0, 3),
      dues: pendingDues
    };
  }

  public async getResidentProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound("Resident account not found.");
    }
    const unit = await userRepository.getUserUnit(user.id);
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      role: user.roleCode,
      isActive: user.isActive,
      unit: unit || null
    };
  }

  public async updateResidentProfile(userId: string, data: { fullName?: string; phoneNumber?: string }) {
    const updated = await userRepository.updateUserProfile(userId, data);
    if (!updated) {
      throw AppError.notFound("Resident account not found.");
    }
    const unit = await userRepository.getUserUnit(updated.id);
    return {
      id: updated.id,
      email: updated.email,
      fullName: updated.fullName,
      phoneNumber: updated.phoneNumber,
      role: updated.roleCode,
      isActive: updated.isActive,
      unit: unit || null
    };
  }

  // ==========================================
  // PHASE 2 — HOUSEHOLD MEMBERS
  // ==========================================

  public async getHouseholdMembers(userId: string) {
    const unit = await userRepository.getUserUnit(userId);
    if (unit) {
      return await householdRepository.getByUnitId(unit.id);
    }
    return await householdRepository.getByResidentUserId(userId);
  }

  public async addHouseholdMember(
    userId: string,
    data: { fullName: string; relationship: string; phoneNumber?: string; isEmergencyContact?: boolean }
  ) {
    const unit = await userRepository.getUserUnit(userId);
    const unitId = unit?.id || "u1111111-2222-3333-4444-555555555551";

    return await householdRepository.create({
      unitId,
      residentUserId: userId,
      fullName: data.fullName,
      relationship: data.relationship,
      phoneNumber: data.phoneNumber,
      isEmergencyContact: data.isEmergencyContact
    });
  }

  public async updateHouseholdMember(
    userId: string,
    memberId: string,
    data: { fullName?: string; relationship?: string; phoneNumber?: string; isEmergencyContact?: boolean }
  ) {
    const existing = await householdRepository.getById(memberId);
    if (!existing) {
      throw AppError.notFound("Household member not found.");
    }

    // Ownership check: must belong to resident or resident's unit
    const unit = await userRepository.getUserUnit(userId);
    if (existing.residentUserId !== userId && (!unit || existing.unitId !== unit.id)) {
      throw AppError.forbidden("Access denied: You do not have permission to modify this household member.");
    }

    const updated = await householdRepository.update(memberId, data);
    if (!updated) {
      throw AppError.notFound("Household member could not be updated.");
    }
    return updated;
  }

  public async deleteHouseholdMember(userId: string, memberId: string) {
    const existing = await householdRepository.getById(memberId);
    if (!existing) {
      throw AppError.notFound("Household member not found.");
    }

    // Ownership check: must belong to resident or resident's unit
    const unit = await userRepository.getUserUnit(userId);
    if (existing.residentUserId !== userId && (!unit || existing.unitId !== unit.id)) {
      throw AppError.forbidden("Access denied: You do not have permission to delete this household member.");
    }

    const deleted = await householdRepository.delete(memberId);
    if (!deleted) {
      throw AppError.notFound("Household member could not be deleted.");
    }
    return { id: memberId, deleted: true };
  }

  // ==========================================
  // PHASE 3 — VEHICLES & PARKING
  // ==========================================

  public async getVehicles(userId: string) {
    const unit = await userRepository.getUserUnit(userId);
    if (unit) {
      return await vehicleRepository.getVehiclesByUnitId(unit.id);
    }
    return await vehicleRepository.getVehiclesByUserId(userId);
  }

  public async addVehicle(
    userId: string,
    data: {
      vehicleNumber: string;
      vehicleType: VehicleType;
      makeModel?: string;
      parkingSlotId?: string;
    }
  ) {
    const unit = await userRepository.getUserUnit(userId);
    const unitId = unit?.id || "u1111111-2222-3333-4444-555555555551";
    const user = await userRepository.findById(userId);

    let parkingSlotNumber: string | undefined;
    if (data.parkingSlotId) {
      const slot = await vehicleRepository.getParkingSlotById(data.parkingSlotId);
      if (slot) {
        parkingSlotNumber = slot.slotNumber;
      }
    }

    return await vehicleRepository.createVehicle({
      unitId,
      unitNumber: unit?.unitNumber,
      userId,
      userName: user?.fullName,
      vehicleNumber: data.vehicleNumber,
      vehicleType: data.vehicleType,
      makeModel: data.makeModel,
      parkingSlotId: data.parkingSlotId,
      parkingSlotNumber
    });
  }

  public async updateVehicle(
    userId: string,
    vehicleId: string,
    data: {
      vehicleNumber?: string;
      vehicleType?: VehicleType;
      makeModel?: string;
      parkingSlotId?: string;
    }
  ) {
    const existing = await vehicleRepository.getVehicleById(vehicleId);
    if (!existing) {
      throw AppError.notFound("Vehicle not found.");
    }

    // Ownership check
    const unit = await userRepository.getUserUnit(userId);
    if (existing.userId !== userId && (!unit || existing.unitId !== unit.id)) {
      throw AppError.forbidden("Access denied: You do not have permission to modify this vehicle.");
    }

    let parkingSlotNumber: string | undefined;
    if (data.parkingSlotId) {
      const slot = await vehicleRepository.getParkingSlotById(data.parkingSlotId);
      if (slot) {
        parkingSlotNumber = slot.slotNumber;
      }
    }

    const updated = await vehicleRepository.updateVehicle(vehicleId, {
      ...data,
      parkingSlotNumber
    });
    if (!updated) {
      throw AppError.notFound("Vehicle could not be updated.");
    }
    return updated;
  }

  public async deleteVehicle(userId: string, vehicleId: string) {
    const existing = await vehicleRepository.getVehicleById(vehicleId);
    if (!existing) {
      throw AppError.notFound("Vehicle not found.");
    }

    // Ownership check
    const unit = await userRepository.getUserUnit(userId);
    if (existing.userId !== userId && (!unit || existing.unitId !== unit.id)) {
      throw AppError.forbidden("Access denied: You do not have permission to delete this vehicle.");
    }

    const deleted = await vehicleRepository.deleteVehicle(vehicleId);
    if (!deleted) {
      throw AppError.notFound("Vehicle could not be deleted.");
    }
    return { id: vehicleId, deleted: true };
  }

  public async getAssignedParking(userId: string) {
    const unit = await userRepository.getUserUnit(userId);
    if (!unit) {
      return [];
    }
    return await vehicleRepository.getParkingSlotsByUnitId(unit.id);
  }

  // ==========================================
  // PHASE 9 — NOTIFICATIONS
  // ==========================================

  public async getNotifications(userId: string) {
    return await notificationRepository.getByUserId(userId);
  }

  public async markNotificationAsRead(userId: string, notificationId: string) {
    const success = await notificationRepository.markAsRead(notificationId, userId);
    if (!success) {
      throw AppError.notFound("Notification not found or access denied.");
    }
    return { id: notificationId, isRead: true };
  }
}

export const residentService = new ResidentService();
