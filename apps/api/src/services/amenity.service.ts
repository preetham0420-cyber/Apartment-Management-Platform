import { amenityRepository } from "../repositories/amenity.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { auditRepository } from "../repositories/audit.repository.js";
import { TokenPayload } from "@apartment/shared";
import { AppError } from "../errors/app-error.js";

export class AmenityService {
  public async getAmenities() {
    return await amenityRepository.getAllAmenities();
  }

  public async getBookings(user: TokenPayload) {
    return await amenityRepository.getBookingsByResident(user.userId);
  }

  public async createBooking(
    user: TokenPayload,
    amenityId: string,
    startTime: string,
    endTime: string
  ) {
    const amenity = await amenityRepository.getAmenityById(amenityId);
    if (!amenity) {
      throw AppError.notFound("Amenity facility not found.");
    }

    if (!amenity.isActive) {
      throw AppError.badRequest("This amenity is currently closed for maintenance.");
    }

    const userUnit = await userRepository.getUserUnit(user.userId);
    const unitId = userUnit?.id || "u1111111-2222-3333-4444-555555555551";
    const dbUser = await userRepository.findById(user.userId);

    const booking = await amenityRepository.createBooking({
      amenityId,
      residentId: user.userId,
      residentName: dbUser?.fullName || user.email,
      unitId,
      startTime,
      endTime
    });

    await auditRepository.logAction({
      actorId: user.userId,
      actorEmail: user.email,
      action: "BOOK_AMENITY",
      resourceType: "AMENITY_BOOKING",
      resourceId: booking.id,
      details: { amenityName: amenity.name, startTime, endTime }
    });

    return booking;
  }

  public async cancelBooking(user: TokenPayload, bookingId: string) {
    const booking = await amenityRepository.getBookingById(bookingId);
    if (!booking) {
      throw AppError.notFound("Amenity booking not found.");
    }

    // Ownership check: resident must own booking or be admin
    if (user.role !== "SUPER_ADMIN" && user.role !== "COMMITTEE_MEMBER") {
      if (booking.residentId !== user.userId) {
        throw AppError.forbidden("Access denied: You do not own this amenity booking.");
      }
    }

    const success = await amenityRepository.cancelBooking(bookingId);
    if (!success) {
      throw AppError.badRequest("Could not cancel booking.");
    }

    await auditRepository.logAction({
      actorId: user.userId,
      actorEmail: user.email,
      action: "CANCEL_AMENITY_BOOKING",
      resourceType: "AMENITY_BOOKING",
      resourceId: bookingId,
      details: { amenityId: booking.amenityId }
    });

    return { id: bookingId, status: "CANCELLED" };
  }
}

export const amenityService = new AmenityService();
