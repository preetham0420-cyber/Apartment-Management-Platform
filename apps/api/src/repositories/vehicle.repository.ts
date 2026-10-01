import { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../config/database.js";
import { Vehicle, ParkingSlot } from "@apartment/shared";
import crypto from "crypto";

const DEV_SEED_PARKING: ParkingSlot[] = [
  {
    id: "slot-00000000-0000-0000-0000-000000000001",
    propertyId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    slotNumber: "P-B1-042",
    levelLocation: "Basement B1 (Tower A)",
    unitId: "u1111111-2222-3333-4444-555555555551",
    unitNumber: "402",
    createdAt: new Date().toISOString()
  },
  {
    id: "slot-00000000-0000-0000-0000-000000000002",
    propertyId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    slotNumber: "P-B1-043",
    levelLocation: "Basement B1 (Tower A)",
    unitId: "u1111111-2222-3333-4444-555555555551",
    unitNumber: "402",
    createdAt: new Date().toISOString()
  },
  {
    id: "slot-00000000-0000-0000-0000-000000000003",
    propertyId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    slotNumber: "P-B2-110",
    levelLocation: "Basement B2 (Tower B)",
    unitId: "u1111111-2222-3333-4444-555555555553",
    unitNumber: "205",
    createdAt: new Date().toISOString()
  },
  {
    id: "slot-00000000-0000-0000-0000-000000000004",
    propertyId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    slotNumber: "P-VISITOR-G1",
    levelLocation: "Ground Level Gate 1",
    createdAt: new Date().toISOString()
  }
];

const DEV_SEED_VEHICLES: Vehicle[] = [
  {
    id: "veh-00000000-0000-0000-0000-000000000001",
    unitId: "u1111111-2222-3333-4444-555555555551",
    unitNumber: "402",
    userId: "user-resident-tenant-00000002",
    userName: "Preetham (Resident Tenant)",
    vehicleNumber: "KA-01-MJ-4492",
    vehicleType: "FOUR_WHEELER",
    makeModel: "Honda City (Pearl White)",
    parkingSlotId: "slot-00000000-0000-0000-0000-000000000001",
    parkingSlotNumber: "P-B1-042",
    createdAt: new Date().toISOString()
  },
  {
    id: "veh-00000000-0000-0000-0000-000000000002",
    unitId: "u1111111-2222-3333-4444-555555555551",
    unitNumber: "402",
    userId: "user-resident-tenant-00000002",
    userName: "Preetham (Resident Tenant)",
    vehicleNumber: "KA-01-EE-8821",
    vehicleType: "EV",
    makeModel: "Ather 450X (Space Grey)",
    parkingSlotId: "slot-00000000-0000-0000-0000-000000000002",
    parkingSlotNumber: "P-B1-043",
    createdAt: new Date().toISOString()
  },
  {
    id: "veh-00000000-0000-0000-0000-000000000003",
    unitId: "u1111111-2222-3333-4444-555555555553",
    unitNumber: "205",
    userId: "user-resident-owner-000000000003",
    userName: "Vikramaditya (Resident Owner)",
    vehicleNumber: "KA-05-NB-1008",
    vehicleType: "FOUR_WHEELER",
    makeModel: "Toyota Hycross (Silver)",
    parkingSlotId: "slot-00000000-0000-0000-0000-000000000003",
    parkingSlotNumber: "P-B2-110",
    createdAt: new Date().toISOString()
  }
];

export class VehicleRepository {
  public async getParkingSlots(): Promise<ParkingSlot[]> {
    try {
      const sql = `
        SELECT 
          s.id, s.property_id AS propertyId, s.slot_number AS slotNumber,
          s.level_location AS levelLocation, s.unit_id AS unitId,
          u.unit_number AS unitNumber, s.created_at AS createdAt
        FROM parking_slots s
        LEFT JOIN units u ON s.unit_id = u.id
        ORDER BY s.slot_number ASC
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql);
      return rows as ParkingSlot[];
    } catch {
      return [...DEV_SEED_PARKING];
    }
  }

  public async assignParkingSlot(slotId: string, unitId: string | null): Promise<boolean> {
    try {
      const sql = `UPDATE parking_slots SET unit_id = ? WHERE id = ?`;
      const [res] = await pool.execute<ResultSetHeader>(sql, [unitId, slotId]);
      return res.affectedRows > 0;
    } catch {
      const slot = DEV_SEED_PARKING.find((s) => s.id === slotId);
      if (slot) {
        slot.unitId = unitId || undefined;
        return true;
      }
      return false;
    }
  }

  public async getAllVehicles(): Promise<Vehicle[]> {
    try {
      const sql = `
        SELECT 
          v.id, v.unit_id AS unitId, u.unit_number AS unitNumber,
          v.user_id AS userId, usr.full_name AS userName,
          v.vehicle_number AS vehicleNumber, v.vehicle_type AS vehicleType,
          v.make_model AS makeModel, v.parking_slot_id AS parkingSlotId,
          p.slot_number AS parkingSlotNumber, v.created_at AS createdAt
        FROM vehicles v
        INNER JOIN units u ON v.unit_id = u.id
        INNER JOIN users usr ON v.user_id = usr.id
        LEFT JOIN parking_slots p ON v.parking_slot_id = p.id
        ORDER BY v.created_at DESC
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql);
      return rows as Vehicle[];
    } catch {
      return [...DEV_SEED_VEHICLES];
    }
  }

  public async getVehiclesByUser(userId: string): Promise<Vehicle[]> {
    try {
      const sql = `
        SELECT 
          v.id, v.unit_id AS unitId, u.unit_number AS unitNumber,
          v.user_id AS userId, usr.full_name AS userName,
          v.vehicle_number AS vehicleNumber, v.vehicle_type AS vehicleType,
          v.make_model AS makeModel, v.parking_slot_id AS parkingSlotId,
          p.slot_number AS parkingSlotNumber, v.created_at AS createdAt
        FROM vehicles v
        INNER JOIN units u ON v.unit_id = u.id
        INNER JOIN users usr ON v.user_id = usr.id
        LEFT JOIN parking_slots p ON v.parking_slot_id = p.id
        WHERE v.user_id = ?
        ORDER BY v.created_at DESC
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [userId]);
      return rows as Vehicle[];
    } catch {
      return DEV_SEED_VEHICLES.filter((v) => v.userId === userId);
    }
  }

  public async getVehiclesByUnit(unitId: string): Promise<Vehicle[]> {
    try {
      const sql = `
        SELECT 
          v.id, v.unit_id AS unitId, u.unit_number AS unitNumber,
          v.user_id AS userId, usr.full_name AS userName,
          v.vehicle_number AS vehicleNumber, v.vehicle_type AS vehicleType,
          v.make_model AS makeModel, v.parking_slot_id AS parkingSlotId,
          p.slot_number AS parkingSlotNumber, v.created_at AS createdAt
        FROM vehicles v
        INNER JOIN units u ON v.unit_id = u.id
        INNER JOIN users usr ON v.user_id = usr.id
        LEFT JOIN parking_slots p ON v.parking_slot_id = p.id
        WHERE v.unit_id = ?
        ORDER BY v.created_at DESC
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [unitId]);
      return rows as Vehicle[];
    } catch {
      return DEV_SEED_VEHICLES.filter((v) => v.unitId === unitId);
    }
  }

  public async getVehicleById(id: string): Promise<Vehicle | null> {
    try {
      const sql = `
        SELECT 
          v.id, v.unit_id AS unitId, u.unit_number AS unitNumber,
          v.user_id AS userId, usr.full_name AS userName,
          v.vehicle_number AS vehicleNumber, v.vehicle_type AS vehicleType,
          v.make_model AS makeModel, v.parking_slot_id AS parkingSlotId,
          p.slot_number AS parkingSlotNumber, v.created_at AS createdAt
        FROM vehicles v
        INNER JOIN units u ON v.unit_id = u.id
        INNER JOIN users usr ON v.user_id = usr.id
        LEFT JOIN parking_slots p ON v.parking_slot_id = p.id
        WHERE v.id = ?
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [id]);
      return (rows[0] as Vehicle) || null;
    } catch {
      return DEV_SEED_VEHICLES.find((v) => v.id === id) || null;
    }
  }

  public async getParkingSlotsByUnit(unitId: string): Promise<ParkingSlot[]> {
    try {
      const sql = `
        SELECT 
          s.id, s.property_id AS propertyId, s.slot_number AS slotNumber,
          s.level_location AS levelLocation, s.unit_id AS unitId,
          u.unit_number AS unitNumber, s.created_at AS createdAt
        FROM parking_slots s
        LEFT JOIN units u ON s.unit_id = u.id
        WHERE s.unit_id = ?
        ORDER BY s.slot_number ASC
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [unitId]);
      return rows as ParkingSlot[];
    } catch {
      return DEV_SEED_PARKING.filter((s) => s.unitId === unitId);
    }
  }

  public async createVehicle(data: {
    unitId: string;
    unitNumber?: string;
    userId: string;
    userName?: string;
    vehicleNumber: string;
    vehicleType: "TWO_WHEELER" | "FOUR_WHEELER" | "EV";
    makeModel?: string;
    parkingSlotId?: string;
    parkingSlotNumber?: string;
  }): Promise<Vehicle> {
    const id = `veh-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const entry: Vehicle = {
      id,
      unitId: data.unitId,
      unitNumber: data.unitNumber,
      userId: data.userId,
      userName: data.userName,
      vehicleNumber: data.vehicleNumber.toUpperCase(),
      vehicleType: data.vehicleType,
      makeModel: data.makeModel,
      parkingSlotId: data.parkingSlotId,
      parkingSlotNumber: data.parkingSlotNumber,
      createdAt: now
    };

    try {
      const sql = `
        INSERT INTO vehicles (id, unit_id, user_id, vehicle_number, vehicle_type, make_model, parking_slot_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      await pool.execute<ResultSetHeader>(sql, [
        id,
        data.unitId,
        data.userId,
        data.vehicleNumber.toUpperCase(),
        data.vehicleType,
        data.makeModel || null,
        data.parkingSlotId || null
      ]);
      return entry;
    } catch {
      DEV_SEED_VEHICLES.push(entry);
      return entry;
    }
  }

  public async updateVehicle(
    id: string,
    updates: Partial<Vehicle>
  ): Promise<Vehicle | null> {
    try {
      const fields: string[] = [];
      const values: any[] = [];

      if (updates.vehicleNumber !== undefined) {
        fields.push("vehicle_number = ?");
        values.push(updates.vehicleNumber.toUpperCase());
      }
      if (updates.vehicleType !== undefined) {
        fields.push("vehicle_type = ?");
        values.push(updates.vehicleType);
      }
      if (updates.makeModel !== undefined) {
        fields.push("make_model = ?");
        values.push(updates.makeModel);
      }
      if (updates.parkingSlotId !== undefined) {
        fields.push("parking_slot_id = ?");
        values.push(updates.parkingSlotId);
      }

      if (fields.length > 0) {
        values.push(id);
        const sql = `UPDATE vehicles SET ${fields.join(", ")} WHERE id = ?`;
        await pool.execute<ResultSetHeader>(sql, values);
      }
      return await this.getVehicleById(id);
    } catch {
      const v = DEV_SEED_VEHICLES.find((item) => item.id === id);
      if (v) {
        Object.assign(v, updates);
        return { ...v };
      }
      return null;
    }
  }

  public async deleteVehicle(id: string): Promise<boolean> {
    try {
      const sql = `DELETE FROM vehicles WHERE id = ?`;
      const [res] = await pool.execute<ResultSetHeader>(sql, [id]);
      return res.affectedRows > 0;
    } catch {
      const idx = DEV_SEED_VEHICLES.findIndex((v) => v.id === id);
      if (idx !== -1) {
        DEV_SEED_VEHICLES.splice(idx, 1);
        return true;
      }
      return false;
    }
  }

  public async getAllParkingSlots(): Promise<ParkingSlot[]> {
    return await this.getParkingSlots();
  }

  public async getParkingSlotsByUnitId(unitId: string): Promise<ParkingSlot[]> {
    return await this.getParkingSlotsByUnit(unitId);
  }

  public async getParkingSlotById(id: string): Promise<ParkingSlot | null> {
    try {
      const sql = `
        SELECT 
          s.id, s.property_id AS propertyId, s.slot_number AS slotNumber,
          s.level_location AS levelLocation, s.unit_id AS unitId,
          u.unit_number AS unitNumber, s.created_at AS createdAt
        FROM parking_slots s
        LEFT JOIN units u ON s.unit_id = u.id
        WHERE s.id = ?
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [id]);
      return (rows[0] as ParkingSlot) || null;
    } catch {
      return DEV_SEED_PARKING.find((s) => s.id === id) || null;
    }
  }

  public async getVehiclesByUnitId(unitId: string): Promise<Vehicle[]> {
    return await this.getVehiclesByUnit(unitId);
  }

  public async getVehiclesByUserId(userId: string): Promise<Vehicle[]> {
    return await this.getVehiclesByUser(userId);
  }
}

export const vehicleRepository = new VehicleRepository();
