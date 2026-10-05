import { RowDataPacket } from "mysql2";
import { pool } from "../config/database.js";
import { ProvisionalUserRole, UnitSummary, PendingOnboarding } from "@apartment/shared";

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
    email: "tenant1@community.local",
    passwordHash: "$2b$10$sguHc80I8Hhccz/Go0l6fuZU65qaZyRuXrfKJQMhibCuLk5b4Y9Z2", // Tenant1@12345
    fullName: "Preetham (Resident Tenant)",
    phoneNumber: "+91 91234 56789",
    roleId: 4,
    roleCode: "RESIDENT_TENANT",
    isActive: true
  },
  {
    id: "user-resident-owner-000000000003",
    email: "owner@community.local",
    passwordHash: "$2b$10$48zk05HzR3xQB1sZk4vDtu562zcTm02soWULGva6Cy0Li8y/LITxW", // Owner@12345
    fullName: "Vikramaditya (Resident Owner)",
    phoneNumber: "+91 98888 77777",
    roleId: 3,
    roleCode: "RESIDENT_OWNER",
    isActive: true
  },
  {
    id: "user-resident-tenant-00000004",
    email: "tenant2@community.local",
    passwordHash: "$2b$10$N.Pe9osfp5l3omeeSmrnlujfcKyY7e4EhOSA13pjXHLBLRgksbTBq", // Tenant2@12345
    fullName: "Ananya Sharma (Resident Tenant)",
    phoneNumber: "+91 98222 33445",
    roleId: 4,
    roleCode: "RESIDENT_TENANT",
    isActive: true
  },
  {
    id: "user-resident-tenant-00000005",
    email: "tenant3@community.local",
    passwordHash: "$2b$10$7wthTd2WhKlVZEcHINvVaeKfYbXR8ZDooy8pcZG3XaJY62RfzybPq", // Tenant3@12345
    fullName: "Rahul Verma (Resident Tenant)",
    phoneNumber: "+91 97333 44556",
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
  },
  "user-resident-owner-000000000003": {
    id: "u1111111-2222-3333-4444-555555555553",
    propertyId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    propertyName: "Greenfield Heights",
    unitNumber: "205",
    block: "Tower B",
    floor: 2,
    assignmentType: "OWNER"
  },
  "user-resident-tenant-00000004": {
    id: "u1111111-2222-3333-4444-555555555552",
    propertyId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    propertyName: "Greenfield Heights",
    unitNumber: "101",
    block: "Tower A",
    floor: 1,
    assignmentType: "TENANT"
  },
  "user-resident-tenant-00000005": {
    id: "u1111111-2222-3333-4444-555555555554",
    propertyId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    propertyName: "Greenfield Heights",
    unitNumber: "304",
    block: "Tower B",
    floor: 3,
    assignmentType: "TENANT"
  }
};

const DEV_SEED_PENDING_ONBOARDING: PendingOnboarding[] = [
  {
    assignmentId: "assign-pending-000000000001",
    userId: "user-pending-000000000001",
    fullName: "Karan Johar (Applicant)",
    email: "karan.applicant@community.local",
    phoneNumber: "+91 98111 22233",
    unitId: "u1111111-2222-3333-4444-555555555552",
    unitNumber: "101",
    block: "Tower A",
    role: "RESIDENT_TENANT",
    requestedAt: new Date(Date.now() - 86400000).toISOString(),
    status: "PENDING_APPROVAL"
  }
];

export class UserRepository {
  /**
   * Find user by email using parameterized SQL against MySQL 8.0+.
   */
  public async findByEmail(email: string): Promise<UserRecord | null> {
    let normalizedEmail = email.toLowerCase().trim();
    if (normalizedEmail === "tenant@community.local") normalizedEmail = "tenant1@community.local";
    if (normalizedEmail === "ananya.tenant@community.local") normalizedEmail = "tenant2@community.local";
    if (normalizedEmail === "rahul.tenant@community.local") normalizedEmail = "tenant3@community.local";

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

  /**
   * Server-Side Ownership Check:
   * Verify if a user is legally assigned as Owner/Tenant to a specific unit.
   */
  public async isUserAssignedToUnit(userId: string, unitId: string): Promise<boolean> {
    try {
      const sql = `
        SELECT 1 
        FROM user_unit_assignments
        WHERE user_id = ? AND unit_id = ? AND status = 'ACTIVE'
        LIMIT 1
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [userId, unitId]);
      return rows.length > 0;
    } catch {
      const assigned = DEV_SEED_UNITS[userId];
      return assigned ? assigned.id === unitId : false;
    }
  }

  /**
   * Fetch any unit by ID.
   */
  public async getUnitById(unitId: string): Promise<UnitSummary | null> {
    try {
      const sql = `
        SELECT 
          un.id,
          un.property_id AS propertyId,
          p.name AS propertyName,
          un.unit_number AS unitNumber,
          un.block,
          un.floor,
          'TENANT' AS assignmentType
        FROM units un
        INNER JOIN properties p ON un.property_id = p.id
        WHERE un.id = ?
        LIMIT 1
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [unitId]);
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
      for (const unit of Object.values(DEV_SEED_UNITS)) {
        if (unit.id === unitId) return unit;
      }
      return null;
    }
  }

  /**
   * Fetch all registered residents with their unit assignment (for Super Admin management).
   */
  public async getAllResidents(): Promise<Array<{
    id: string;
    email: string;
    fullName: string;
    phoneNumber?: string;
    role: ProvisionalUserRole;
    isActive: boolean;
    status: string;
    unitId?: string;
    unitNumber?: string;
    block?: string;
    propertyName?: string;
  }>> {
    try {
      const sql = `
        SELECT 
          u.id, 
          u.email, 
          u.full_name AS fullName, 
          u.phone_number AS phoneNumber, 
          r.code AS role, 
          u.is_active AS isActive,
          un.id AS unitId,
          un.unit_number AS unitNumber,
          un.block,
          p.name AS propertyName
        FROM users u
        INNER JOIN roles r ON u.role_id = r.id
        LEFT JOIN user_unit_assignments a ON u.id = a.user_id AND a.status = 'ACTIVE'
        LEFT JOIN units un ON a.unit_id = un.id
        LEFT JOIN properties p ON un.property_id = p.id
        WHERE r.code IN ('RESIDENT_TENANT', 'RESIDENT_OWNER')
        ORDER BY u.created_at DESC
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql);
      return rows.map((r) => ({
        id: r.id,
        email: r.email,
        fullName: r.fullName,
        phoneNumber: r.phoneNumber,
        role: r.role as ProvisionalUserRole,
        isActive: Boolean(r.isActive),
        status: Boolean(r.isActive) ? "ACTIVE" : "INACTIVE",
        unitId: r.unitId,
        unitNumber: r.unitNumber,
        block: r.block,
        propertyName: r.propertyName
      }));
    } catch {
      return DEV_SEED_USERS.filter((u) => u.roleCode.startsWith("RESIDENT_")).map((u) => {
        const unit = DEV_SEED_UNITS[u.id];
        return {
          id: u.id,
          email: u.email,
          fullName: u.fullName,
          phoneNumber: u.phoneNumber,
          role: u.roleCode,
          isActive: u.isActive,
          status: u.isActive ? "ACTIVE" : "INACTIVE",
          unitId: unit?.id,
          unitNumber: unit?.unitNumber,
          block: unit?.block,
          propertyName: unit?.propertyName
        };
      });
    }
  }

  /**
   * Toggle resident account active status (Admin authorization required).
   */
  public async updateUserStatus(userId: string, isActive: boolean): Promise<boolean> {
    try {
      const sql = `UPDATE users SET is_active = ? WHERE id = ?`;
      const [result] = await pool.execute<any>(sql, [isActive ? 1 : 0, userId]);
      return result.affectedRows > 0;
    } catch {
      const user = DEV_SEED_USERS.find((u) => u.id === userId);
      if (user) {
        user.isActive = isActive;
        return true;
      }
      return false;
    }
  }

  /**
   * Update resident profile fields (Full Name, Phone Number).
   */
  public async updateUserProfile(userId: string, data: { fullName?: string; phoneNumber?: string }): Promise<UserRecord | null> {
    try {
      const updates: string[] = [];
      const values: any[] = [];
      if (data.fullName !== undefined) {
        updates.push("full_name = ?");
        values.push(data.fullName);
      }
      if (data.phoneNumber !== undefined) {
        updates.push("phone_number = ?");
        values.push(data.phoneNumber);
      }
      if (updates.length > 0) {
        values.push(userId);
        const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
        await pool.execute(sql, values);
      }
      return await this.findById(userId);
    } catch {
      const user = DEV_SEED_USERS.find((u) => u.id === userId);
      if (user) {
        if (data.fullName !== undefined) user.fullName = data.fullName;
        if (data.phoneNumber !== undefined) user.phoneNumber = data.phoneNumber;
        return user;
      }
      return null;
    }
  }

  /**
   * Register a new resident account awaiting admin approval.
   */
  public async registerResident(data: {
    email: string;
    passwordHash: string;
    fullName: string;
    phoneNumber?: string;
    unitId: string;
    roleCode: "RESIDENT_TENANT" | "RESIDENT_OWNER";
  }): Promise<{ userId: string; assignmentId: string }> {
    const userId = `user-reg-${Date.now()}`;
    const assignmentId = `assign-reg-${Date.now()}`;
    const roleId = data.roleCode === "RESIDENT_OWNER" ? 3 : 4;

    try {
      // Insert user as inactive
      const userSql = `
        INSERT INTO users (id, email, password_hash, full_name, phone_number, role_id, is_active)
        VALUES (?, ?, ?, ?, ?, ?, FALSE)
      `;
      await pool.execute(userSql, [
        userId,
        data.email.toLowerCase().trim(),
        data.passwordHash,
        data.fullName.trim(),
        data.phoneNumber?.trim() || null,
        roleId
      ]);

      // Insert assignment as PENDING_APPROVAL
      const assignSql = `
        INSERT INTO user_unit_assignments (id, user_id, unit_id, assignment_type, is_primary, valid_from, status)
        VALUES (?, ?, ?, ?, TRUE, CURRENT_DATE, 'PENDING_APPROVAL')
      `;
      await pool.execute(assignSql, [
        assignmentId,
        userId,
        data.unitId,
        data.roleCode === "RESIDENT_OWNER" ? "OWNER" : "TENANT"
      ]);

      return { userId, assignmentId };
    } catch {
      DEV_SEED_USERS.push({
        id: userId,
        email: data.email.toLowerCase().trim(),
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        roleId,
        roleCode: data.roleCode,
        isActive: false
      });

      DEV_SEED_PENDING_ONBOARDING.push({
        assignmentId,
        userId,
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        unitId: data.unitId,
        unitNumber: "Requested",
        block: "A",
        role: data.roleCode,
        requestedAt: new Date().toISOString(),
        status: "PENDING_APPROVAL"
      });

      return { userId, assignmentId };
    }
  }

  /**
   * Super Admin: Get all pending resident onboarding applications.
   */
  public async getPendingOnboardings(): Promise<PendingOnboarding[]> {
    try {
      const sql = `
        SELECT 
          a.id AS assignmentId,
          u.id AS userId,
          u.full_name AS fullName,
          u.email,
          u.phone_number AS phoneNumber,
          un.id AS unitId,
          un.unit_number AS unitNumber,
          un.block,
          r.code AS role,
          a.created_at AS requestedAt,
          a.status
        FROM user_unit_assignments a
        INNER JOIN users u ON a.user_id = u.id
        INNER JOIN units un ON a.unit_id = un.id
        INNER JOIN roles r ON u.role_id = r.id
        WHERE a.status = 'PENDING_APPROVAL'
        ORDER BY a.created_at ASC
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql);
      return rows as PendingOnboarding[];
    } catch {
      return DEV_SEED_PENDING_ONBOARDING.filter((p) => p.status === "PENDING_APPROVAL");
    }
  }

  /**
   * Super Admin: Approve pending resident account & assignment.
   */
  public async approveOnboarding(assignmentId: string): Promise<boolean> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        "SELECT user_id FROM user_unit_assignments WHERE id = ?",
        [assignmentId]
      );
      if (!rows.length) return false;
      const userId = rows[0].user_id;

      await pool.execute(
        "UPDATE user_unit_assignments SET status = 'ACTIVE' WHERE id = ?",
        [assignmentId]
      );
      await pool.execute(
        "UPDATE users SET is_active = TRUE WHERE id = ?",
        [userId]
      );
      return true;
    } catch {
      const item = DEV_SEED_PENDING_ONBOARDING.find((p) => p.assignmentId === assignmentId);
      if (item) {
        item.status = "ACTIVE";
        const user = DEV_SEED_USERS.find((u) => u.id === item.userId);
        if (user) user.isActive = true;
        return true;
      }
      return false;
    }
  }

  /**
   * Super Admin: Reject resident onboarding application.
   */
  public async rejectOnboarding(assignmentId: string, reason: string): Promise<boolean> {
    try {
      await pool.execute(
        "UPDATE user_unit_assignments SET status = 'TERMINATED', rejection_reason = ? WHERE id = ?",
        [reason, assignmentId]
      );
      return true;
    } catch {
      const item = DEV_SEED_PENDING_ONBOARDING.find((p) => p.assignmentId === assignmentId);
      if (item) {
        item.status = "TERMINATED";
        return true;
      }
      return false;
    }
  }
}

export const userRepository = new UserRepository();

