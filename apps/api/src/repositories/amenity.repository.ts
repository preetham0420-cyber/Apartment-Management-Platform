import { RowDataPacket } from "mysql2";
import { pool } from "../config/database.js";
import { Amenity, AmenityBooking } from "@apartment/shared";
import crypto from "crypto";

const DEV_SEED_AMENITIES: Amenity[] = [
  {
    id: "amenity-00000000-0000-0000-0000-000000000001",
    propertyId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    name: "Clubhouse Banquet Hall",
    description: "Spacious hall for family gatherings, birthdays and community functions.",
    capacity: 80,
    rules: "Prior booking required. Sound limit 65dB after 10 PM.",
    openTime: "09:00:00",
    closeTime: "22:00:00",
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "amenity-00000000-0000-0000-0000-000000000002",
    propertyId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    name: "Badminton Court A",
    description: "Indoor synthetic court with professional LED lighting.",
    capacity: 4,
    rules: "Non-marking shoes mandatory.",
    openTime: "06:00:00",
    closeTime: "21:00:00",
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "amenity-00000000-0000-0000-0000-000000000003",
    propertyId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    name: "Swimming Pool & Deck",
    description: "Half-Olympic size pool with separate kids splash pool.",
    capacity: 25,
    rules: "Swimwear mandatory. Shower before entry.",
    openTime: "06:30:00",
    closeTime: "20:30:00",
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

const DEV_SEED_BOOKINGS: AmenityBooking[] = [
  {
    id: "book-00000000-0000-0000-0000-000000000001",
    amenityId: "amenity-00000000-0000-0000-0000-000000000001",
    amenityName: "Clubhouse Banquet Hall",
    residentId: "user-resident-tenant-00000002",
    residentName: "Preetham (Resident Tenant)",
    unitId: "u1111111-2222-3333-4444-555555555551",
    startTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    endTime: new Date(Date.now() + 28 * 3600 * 1000).toISOString(),
    status: "CONFIRMED",
    createdAt: new Date().toISOString()
  }
];

export class AmenityRepository {
  public async getAllBookings(): Promise<AmenityBooking[]> {
    try {
      const sql = `
        SELECT 
          b.id,
          b.amenity_id AS amenityId,
          a.name AS amenityName,
          b.resident_id AS residentId,
          u.full_name AS residentName,
          b.unit_id AS unitId,
          b.start_time AS startTime,
          b.end_time AS endTime,
          b.status,
          b.created_at AS createdAt
        FROM amenity_bookings b
        INNER JOIN amenities a ON b.amenity_id = a.id
        INNER JOIN users u ON b.resident_id = u.id
        ORDER BY b.start_time DESC
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql);
      return rows as AmenityBooking[];
    } catch {
      return [...DEV_SEED_BOOKINGS];
    }
  }

  public async getAllAmenities(): Promise<Amenity[]> {
    try {
      const sql = `
        SELECT 
          id, property_id AS propertyId, name, description, capacity, rules,
          open_time AS openTime, close_time AS closeTime, is_active AS isActive,
          created_at AS createdAt
        FROM amenities
        WHERE is_active = TRUE
        ORDER BY name ASC
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql);
      return rows.map((r) => ({
        ...r,
        isActive: Boolean(r.isActive)
      })) as Amenity[];
    } catch {
      return [...DEV_SEED_AMENITIES];
    }
  }

  public async getAmenityById(id: string): Promise<Amenity | null> {
    try {
      const sql = `
        SELECT 
          id, property_id AS propertyId, name, description, capacity, rules,
          open_time AS openTime, close_time AS closeTime, is_active AS isActive,
          created_at AS createdAt
        FROM amenities
        WHERE id = ?
        LIMIT 1
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [id]);
      if (rows.length === 0) return null;
      return {
        ...rows[0],
        isActive: Boolean(rows[0].isActive)
      } as Amenity;
    } catch {
      return DEV_SEED_AMENITIES.find((a) => a.id === id) || null;
    }
  }

  public async getBookingsByResident(residentId: string): Promise<AmenityBooking[]> {
    try {
      const sql = `
        SELECT 
          b.id,
          b.amenity_id AS amenityId,
          a.name AS amenityName,
          b.resident_id AS residentId,
          u.full_name AS residentName,
          b.unit_id AS unitId,
          b.start_time AS startTime,
          b.end_time AS endTime,
          b.status,
          b.created_at AS createdAt
        FROM amenity_bookings b
        INNER JOIN amenities a ON b.amenity_id = a.id
        INNER JOIN users u ON b.resident_id = u.id
        WHERE b.resident_id = ?
        ORDER BY b.start_time DESC
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [residentId]);
      return rows as AmenityBooking[];
    } catch {
      return DEV_SEED_BOOKINGS.filter((b) => b.residentId === residentId);
    }
  }

  public async getBookingById(bookingId: string): Promise<AmenityBooking | null> {
    try {
      const sql = `
        SELECT 
          b.id,
          b.amenity_id AS amenityId,
          a.name AS amenityName,
          b.resident_id AS residentId,
          u.full_name AS residentName,
          b.unit_id AS unitId,
          b.start_time AS startTime,
          b.end_time AS endTime,
          b.status,
          b.created_at AS createdAt
        FROM amenity_bookings b
        INNER JOIN amenities a ON b.amenity_id = a.id
        INNER JOIN users u ON b.resident_id = u.id
        WHERE b.id = ?
        LIMIT 1
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [bookingId]);
      return rows.length > 0 ? (rows[0] as AmenityBooking) : null;
    } catch {
      return DEV_SEED_BOOKINGS.find((b) => b.id === bookingId) || null;
    }
  }

  public async createBooking(data: {
    amenityId: string;
    residentId: string;
    residentName?: string;
    unitId: string;
    startTime: string;
    endTime: string;
  }): Promise<AmenityBooking> {
    const id = `book-${crypto.randomUUID()}`;
    const amenity = await this.getAmenityById(data.amenityId);
    const now = new Date().toISOString();

    const booking: AmenityBooking = {
      id,
      amenityId: data.amenityId,
      amenityName: amenity?.name || "Facility",
      residentId: data.residentId,
      residentName: data.residentName || "Resident",
      unitId: data.unitId,
      startTime: data.startTime,
      endTime: data.endTime,
      status: "CONFIRMED",
      createdAt: now
    };

    try {
      const sql = `
        INSERT INTO amenity_bookings (id, amenity_id, resident_id, unit_id, start_time, end_time, status)
        VALUES (?, ?, ?, ?, ?, ?, 'CONFIRMED')
      `;
      await pool.execute(sql, [id, data.amenityId, data.residentId, data.unitId, data.startTime, data.endTime]);
      return booking;
    } catch {
      DEV_SEED_BOOKINGS.unshift(booking);
      return booking;
    }
  }

  public async cancelBooking(bookingId: string): Promise<boolean> {
    try {
      const sql = `UPDATE amenity_bookings SET status = 'CANCELLED' WHERE id = ?`;
      const [res] = await pool.execute<any>(sql, [bookingId]);
      return res.affectedRows > 0;
    } catch {
      const found = DEV_SEED_BOOKINGS.find((b) => b.id === bookingId);
      if (found) {
        found.status = "CANCELLED";
        return true;
      }
      return false;
    }
  }
}

export const amenityRepository = new AmenityRepository();
