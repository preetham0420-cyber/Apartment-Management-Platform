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

  public async getAmenitySchedule(amenityId: string) {
    const amenity = await amenityRepository.getAmenityById(amenityId);
    if (!amenity) {
      throw AppError.notFound("Amenity facility not found.");
    }
    return await amenityRepository.getBookingsByAmenity(amenityId);
  }

  public async createBooking(
    user: TokenPayload,
    amenityId: string,
    startTime: string,
    endTime: string
  ) {
    const startMs = new Date(startTime).getTime();
    const endMs = new Date(endTime).getTime();

    if (isNaN(startMs) || isNaN(endMs)) {
      throw AppError.badRequest("Invalid ISO timestamp format for booking.");
    }

    if (startMs >= endMs) {
      throw AppError.badRequest("Booking start time must be before end time.");
    }

    if (startMs < Date.now() - 5 * 60 * 1000) {
      throw AppError.badRequest("Cannot reserve a time slot in the past.");
    }

    const durationMinutes = (endMs - startMs) / (1000 * 60);
    if (durationMinutes > 8 * 60) {
      throw AppError.badRequest("Maximum booking duration is 8 hours per session.");
    }

    const amenity = await amenityRepository.getAmenityById(amenityId);
    if (!amenity) {
      throw AppError.notFound("Amenity facility not found.");
    }

    if (!amenity.isActive) {
      throw AppError.badRequest("This amenity is currently closed for maintenance.");
    }

    // Server-side conflict detection
    const conflicting = await amenityRepository.findConflictingBooking(amenityId, startTime, endTime);
    if (conflicting) {
      throw AppError.badRequest("This time slot is already reserved. Please select another slot.");
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
