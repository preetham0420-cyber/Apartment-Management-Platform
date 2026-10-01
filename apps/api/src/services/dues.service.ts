import { duesRepository } from "../repositories/dues.repository.js";
import { auditRepository } from "../repositories/audit.repository.js";
import { TokenPayload } from "@apartment/shared";
import { AppError } from "../errors/app-error.js";

export class DuesService {
  public async getDues(user: TokenPayload) {
    if (user.role === "SUPER_ADMIN" || user.role === "COMMITTEE_MEMBER") {
      return await duesRepository.getAll();
    }
    return await duesRepository.getByResident(user.userId);
  }

  public async recordPayment(
    user: TokenPayload,
    dueId: string,
    paymentReference: string = `DEV-PAY-${Date.now()}`
  ) {
    const due = await duesRepository.getById(dueId);
    if (!due) {
      throw AppError.notFound("Due invoice not found.");
    }

    // Ownership check: resident can only pay their own dues
    if (user.role !== "SUPER_ADMIN" && user.role !== "COMMITTEE_MEMBER") {
      if (due.residentId !== user.userId) {
        throw AppError.forbidden("Access denied: You do not own this due invoice.");
      }
    }

    if (due.status === "PAID") {
      throw AppError.conflict("This due invoice has already been paid.");
    }

    const updated = await duesRepository.recordPayment(dueId, paymentReference);

    await auditRepository.logAction({
      actorId: user.userId,
      actorEmail: user.email,
      action: "RECORD_PAYMENT",
      resourceType: "DUES",
      resourceId: dueId,
      details: { amount: due.amount, paymentReference }
    });

    return updated;
  }
}

export const duesService = new DuesService();
