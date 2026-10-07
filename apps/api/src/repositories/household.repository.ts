import { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../config/database.js";
import { HouseholdMember } from "@apartment/shared";
import crypto from "crypto";

const DEV_SEED_HOUSEHOLD: HouseholdMember[] = [
  {
    id: "hh-00000000-0000-0000-0000-000000000001",
    unitId: "u1111111-2222-3333-4444-555555555551",
    residentUserId: "user-resident-tenant-00000002",
    fullName: "Priya Sharma",
    relationship: "Spouse",
    phoneNumber: "+91 91234 56788",
    isEmergencyContact: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "hh-00000000-0000-0000-0000-000000000002",
    unitId: "u1111111-2222-3333-4444-555555555551",
    residentUserId: "user-resident-tenant-00000002",
    fullName: "Aarav Sharma",
    relationship: "Son",
    phoneNumber: "+91 91234 56787",
    isEmergencyContact: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "hh-00000000-0000-0000-0000-000000000003",
    unitId: "u1111111-2222-3333-4444-555555555553",
    residentUserId: "user-resident-owner-000000000003",
    fullName: "Meera Rao",
    relationship: "Spouse",
    phoneNumber: "+91 98888 77776",
    isEmergencyContact: true,
    createdAt: new Date().toISOString()
  }
];

export class HouseholdRepository {
  public async getByUnitId(unitId: string): Promise<HouseholdMember[]> {
    try {
      const sql = `
        SELECT 
          id, unit_id AS unitId, resident_user_id AS residentUserId,
          full_name AS fullName, relationship, phone_number AS phoneNumber,
          is_emergency_contact AS isEmergencyContact, created_at AS createdAt
        FROM household_members
        WHERE unit_id = ?
        ORDER BY created_at ASC
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [unitId]);
      return rows as HouseholdMember[];
    } catch {
      return DEV_SEED_HOUSEHOLD.filter((h) => h.unitId === unitId);
    }
  }

  public async getByResidentUserId(userId: string): Promise<HouseholdMember[]> {
    try {
      const sql = `
        SELECT 
          id, unit_id AS unitId, resident_user_id AS residentUserId,
          full_name AS fullName, relationship, phone_number AS phoneNumber,
          is_emergency_contact AS isEmergencyContact, created_at AS createdAt
        FROM household_members
        WHERE resident_user_id = ?
        ORDER BY created_at ASC
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [userId]);
      return rows as HouseholdMember[];
    } catch {
      return DEV_SEED_HOUSEHOLD.filter((h) => h.residentUserId === userId);
    }
  }

  public async getById(id: string): Promise<HouseholdMember | null> {
    try {
      const sql = `
        SELECT 
          id, unit_id AS unitId, resident_user_id AS residentUserId,
          full_name AS fullName, relationship, phone_number AS phoneNumber,
          is_emergency_contact AS isEmergencyContact, created_at AS createdAt
        FROM household_members
        WHERE id = ?
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [id]);
      return (rows[0] as HouseholdMember) || null;
    } catch {
      return DEV_SEED_HOUSEHOLD.find((h) => h.id === id) || null;
    }
  }

  public async create(data: {
    unitId: string;
    residentUserId: string;
    fullName: string;
    relationship: string;
    phoneNumber?: string;
    isEmergencyContact?: boolean;
  }): Promise<HouseholdMember> {
    const id = `hh-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const entry: HouseholdMember = {
      id,
      unitId: data.unitId,
      residentUserId: data.residentUserId,
      fullName: data.fullName,
      relationship: data.relationship,
      phoneNumber: data.phoneNumber,
      isEmergencyContact: Boolean(data.isEmergencyContact),
      createdAt: now
    };

    try {
      const sql = `
        INSERT INTO household_members (id, unit_id, resident_user_id, full_name, relationship, phone_number, is_emergency_contact)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      await pool.execute<ResultSetHeader>(sql, [
        id,
        data.unitId,
        data.residentUserId,
        data.fullName,
        data.relationship,
        data.phoneNumber || null,
        Boolean(data.isEmergencyContact)
      ]);
      return entry;
    } catch {
      DEV_SEED_HOUSEHOLD.push(entry);
      return entry;
    }
  }

  public async update(
    id: string,
    updates: Partial<HouseholdMember>
  ): Promise<HouseholdMember | null> {
    try {
      const fields: string[] = [];
      const values: any[] = [];

      if (updates.fullName !== undefined) {
        fields.push("full_name = ?");
        values.push(updates.fullName);
      }
      if (updates.relationship !== undefined) {
        fields.push("relationship = ?");
        values.push(updates.relationship);
      }
      if (updates.phoneNumber !== undefined) {
        fields.push("phone_number = ?");
        values.push(updates.phoneNumber);
      }
      if (updates.isEmergencyContact !== undefined) {
        fields.push("is_emergency_contact = ?");
        values.push(Boolean(updates.isEmergencyContact));
      }

      if (fields.length > 0) {
        values.push(id);
        const sql = `UPDATE household_members SET ${fields.join(", ")} WHERE id = ?`;
        await pool.execute<ResultSetHeader>(sql, values);
      }
      return await this.getById(id);
    } catch {
      const m = DEV_SEED_HOUSEHOLD.find((h) => h.id === id);
      if (m) {
        Object.assign(m, updates);
        return { ...m };
      }
      return null;
    }
  }

  public async delete(id: string): Promise<boolean> {
    try {
      const sql = `DELETE FROM household_members WHERE id = ?`;
      const [res] = await pool.execute<ResultSetHeader>(sql, [id]);
      return res.affectedRows > 0;
    } catch {
      const idx = DEV_SEED_HOUSEHOLD.findIndex((h) => h.id === id);
      if (idx !== -1) {
        DEV_SEED_HOUSEHOLD.splice(idx, 1);
        return true;
      }
      return false;
    }
  }
}

export const householdRepository = new HouseholdRepository();
