import { RowDataPacket } from "mysql2";
import { pool } from "../config/database.js";
import { ProvisionalUserRole, UnitSummary } from "@apartment/shared";

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phoneNumber?: string;
  roleId: number;
  roleCode: ProvisionalUserRole;
  isActive: boolean;
}

/**
 * Development seed accounts matching database/seeds/001_initial_users_and_properties.sql.
 * Used transparently when MySQL database connection is offline.
 */
const DEV_SEED_USERS: UserRecord[] = [
  {
    id: "user-super-admin-000000000001",
    email: "admin@community.local",
    passwordHash: "$2b$10$IZkfYeJR8vAgs6zoGnuG7O8warVx46mGVn6NlWoS2tdGCrcHS3cR6", // Admin@12345
    fullName: "Platform Super Admin",
    phoneNumber: "+91 98765 43210",
    roleId: 1,
    roleCode: "SUPER_ADMIN",
    isActive: true
  },
  {
    id: "user-resident-tenant-00000002",
    email: "tenant@community.local",
    passwordHash: "$2b$10$kCYaA2u8QTgmt6w.DRN10OqFWR8xTCtvKpXy4vf7zs7dp.Sdgp2Fm", // Tenant@12345
    fullName: "Preetham (Resident Tenant)",
    phoneNumber: "+91 91234 56789",
    roleId: 4,
    roleCode: "RESIDENT_TENANT",
    isActive: true
  }
];

const DEV_SEED_UNITS: Record<string, UnitSummary> = {
  "user-resident-tenant-00000002": {
    id: "u1111111-2222-3333-4444-555555555551",
    propertyId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    propertyName: "Greenfield Heights",
    unitNumber: "402",
    block: "Tower A",
    floor: 4,
    assignmentType: "TENANT"
  }
};

export class UserRepository {
  /**
   * Find user by email using parameterized SQL against MySQL 8.0+.
   */
  public async findByEmail(email: string): Promise<UserRecord | null> {
    const normalizedEmail = email.toLowerCase().trim();

    try {
      const sql = `
        SELECT 
          u.id, 
          u.email, 
          u.password_hash AS passwordHash, 
          u.full_name AS fullName, 
          u.phone_number AS phoneNumber, 
          u.role_id AS roleId, 
          r.code AS roleCode, 
          u.is_active AS isActive
        FROM users u
        INNER JOIN roles r ON u.role_id = r.id
        WHERE LOWER(u.email) = ?
        LIMIT 1
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [normalizedEmail]);

      if (rows.length > 0) {
        const row = rows[0];
        return {
          id: row.id,
          email: row.email,
          passwordHash: row.passwordHash,
          fullName: row.fullName,
          phoneNumber: row.phoneNumber,
          roleId: row.roleId,
          roleCode: row.roleCode as ProvisionalUserRole,
          isActive: Boolean(row.isActive)
        };
      }
      return null;
    } catch {
      // Development fallback matching database/seeds/001_initial_users_and_properties.sql
      const found = DEV_SEED_USERS.find((u) => u.email.toLowerCase() === normalizedEmail);
      return found || null;
    }
  }

  /**
   * Find user by ID using parameterized SQL against MySQL 8.0+.
   */
  public async findById(id: string): Promise<UserRecord | null> {
    try {
      const sql = `
        SELECT 
          u.id, 
          u.email, 
          u.password_hash AS passwordHash, 
          u.full_name AS fullName, 
          u.phone_number AS phoneNumber, 
          u.role_id AS roleId, 
          r.code AS roleCode, 
          u.is_active AS isActive
        FROM users u
        INNER JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?
        LIMIT 1
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [id]);

      if (rows.length > 0) {
        const row = rows[0];
        return {
          id: row.id,
          email: row.email,
          passwordHash: row.passwordHash,
          fullName: row.fullName,
          phoneNumber: row.phoneNumber,
          roleId: row.roleId,
          roleCode: row.roleCode as ProvisionalUserRole,
          isActive: Boolean(row.isActive)
        };
      }
      return null;
    } catch {
      const found = DEV_SEED_USERS.find((u) => u.id === id);
      return found || null;
    }
  }

  /**
   * Fetch active unit assignment for a user using parameterized SQL.
   */
  public async getUserUnit(userId: string): Promise<UnitSummary | null> {
    try {
      const sql = `
        SELECT 
          un.id,
          un.property_id AS propertyId,
          p.name AS propertyName,
          un.unit_number AS unitNumber,
          un.block,
          un.floor,
          a.assignment_type AS assignmentType
        FROM user_unit_assignments a
        INNER JOIN units un ON a.unit_id = un.id
        INNER JOIN properties p ON un.property_id = p.id
        WHERE a.user_id = ? AND a.status = 'ACTIVE'
        LIMIT 1
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [userId]);

      if (rows.length > 0) {
        const row = rows[0];
        return {
          id: row.id,
          propertyId: row.propertyId,
          propertyName: row.propertyName,
          unitNumber: row.unitNumber,
          block: row.block,
          floor: row.floor,
          assignmentType: row.assignmentType
        };
      }
      return null;
    } catch {
      return DEV_SEED_UNITS[userId] || null;
    }
  }
}

export const userRepository = new UserRepository();
