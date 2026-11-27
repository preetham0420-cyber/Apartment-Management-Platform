import { RowDataPacket } from "mysql2";
import { pool } from "../config/database.js";
import { Visitor, VisitorStatus, VisitorType, VisitorEntryType } from "@apartment/shared";
import crypto from "crypto";

const DEV_SEED_VISITORS: Visitor[] = [
  {
    id: "vis-00000000-0000-0000-0000-000000000001",
    unitId: "u1111111-2222-3333-4444-555555555551",
    unitNumber: "402",
    block: "Tower A",
    hostUserId: "user-resident-tenant-00000002",
    hostName: "Preetham (Resident Tenant)",
    visitorName: "Amazon Delivery Agent",
    visitorPhone: "+91 99887 76655",
    purpose: "DELIVERY",
    expectedArrival: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    status: "APPROVED",
    entryType: "PRE_APPROVED",
    visitorType: "DELIVERY",
    vehicleNumber: "KA-01-AB-1234",
    notes: "Leave parcel with security if unavailable",
    accessCode: "GATE-4021",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "vis-00000000-0000-0000-0000-000000000002",
    unitId: "u1111111-2222-3333-4444-555555555551",
    unitNumber: "402",
    block: "Tower A",
    hostUserId: "user-resident-tenant-00000002",
    hostName: "Preetham (Resident Tenant)",
    visitorName: "Rahul Sharma (Guest)",
    visitorPhone: "+91 98888 12345",
    purpose: "GUEST",
    expectedArrival: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    status: "PENDING",
    entryType: "WALK_IN",
    visitorType: "GUEST",
    notes: "Friend visiting for evening dinner - waiting at Main Gate 1",
    accessCode: "GATE-4022",
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    id: "vis-00000000-0000-0000-0000-000000000003",
    unitId: "u1111111-2222-3333-4444-555555555551",
    unitNumber: "402",
    block: "Tower A",
    hostUserId: "user-resident-tenant-00000002",
    hostName: "Preetham (Resident Tenant)",
    visitorName: "Urban Company AC Technician",
    visitorPhone: "+91 97777 88899",
    purpose: "SERVICE",
    expectedArrival: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    status: "CHECKED_IN",
    entryType: "PRE_APPROVED",
    visitorType: "SERVICE",
    notes: "Master bedroom AC servicing",
    accessCode: "GATE-4023",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
  },
  {
    id: "vis-00000000-0000-0000-0000-000000000004",
    unitId: "u1111111-2222-3333-4444-555555555553",
    unitNumber: "205",
    block: "Tower B",
    hostUserId: "user-resident-owner-000000000003",
    hostName: "Vikramaditya (Resident Owner)",
    visitorName: "Sunita Reddy (Interior Designer)",
    visitorPhone: "+91 96666 55544",
    purpose: "SERVICE",
    expectedArrival: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    status: "APPROVED",
    entryType: "PRE_APPROVED",
    visitorType: "SERVICE",
    accessCode: "GATE-2051",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "vis-00000000-0000-0000-0000-000000000005",
    unitId: "u1111111-2222-3333-4444-555555555553",
    unitNumber: "205",
    block: "Tower B",
    hostUserId: "user-resident-owner-000000000003",
    hostName: "Vikramaditya (Resident Owner)",
    visitorName: "Swiggy Delivery Partner",
    visitorPhone: "+91 95555 44433",
    purpose: "DELIVERY",
    expectedArrival: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    status: "PENDING",
    entryType: "WALK_IN",
    visitorType: "DELIVERY",
    notes: "Food parcel from Main Gate 1",
    accessCode: "GATE-2052",
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString()
  }
];

export class VisitorRepository {
  public async getVisitorsByHost(hostUserId: string): Promise<Visitor[]> {
    try {
      const sql = `
        SELECT 
          v.id,
          v.unit_id AS unitId,
          un.unit_number AS unitNumber,
          un.block,
          v.host_user_id AS hostUserId,
          u.full_name AS hostName,
          v.visitor_name AS visitorName,
          v.visitor_phone AS visitorPhone,
          v.purpose,
          v.expected_arrival AS expectedArrival,
          v.status,
          v.access_code AS accessCode,
          v.entry_type AS entryType,
          v.visitor_type AS visitorType,
          v.vehicle_number AS vehicleNumber,
          v.notes,
          v.rejection_reason AS rejectionReason,
          v.approved_by_user_id AS approvedByUserId,
          v.approved_at AS approvedAt,
          v.valid_until AS validUntil,
          v.created_at AS createdAt,
          v.updated_at AS updatedAt
        FROM visitors v
        INNER JOIN units un ON v.unit_id = un.id
        INNER JOIN users u ON v.host_user_id = u.id
        WHERE v.host_user_id = ?
        ORDER BY v.expected_arrival DESC
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [hostUserId]);
      return rows as Visitor[];
    } catch {
      return DEV_SEED_VISITORS.filter((v) => v.hostUserId === hostUserId);
    }
  }

  public async getPendingApprovalsByHost(hostUserId: string): Promise<Visitor[]> {
    try {
      const sql = `
        SELECT 
          v.id,
          v.unit_id AS unitId,
          un.unit_number AS unitNumber,
          un.block,
          v.host_user_id AS hostUserId,
          u.full_name AS hostName,
          v.visitor_name AS visitorName,
          v.visitor_phone AS visitorPhone,
          v.purpose,
          v.expected_arrival AS expectedArrival,
          v.status,
          v.access_code AS accessCode,
          v.entry_type AS entryType,
          v.visitor_type AS visitorType,
          v.vehicle_number AS vehicleNumber,
          v.notes,
          v.created_at AS createdAt,
          v.updated_at AS updatedAt
        FROM visitors v
        INNER JOIN units un ON v.unit_id = un.id
        INNER JOIN users u ON v.host_user_id = u.id
        WHERE v.host_user_id = ? AND v.status = 'PENDING'
        ORDER BY v.created_at DESC
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [hostUserId]);
      return rows as Visitor[];
    } catch {
      return DEV_SEED_VISITORS.filter(
        (v) => v.hostUserId === hostUserId && v.status === "PENDING"
      );
    }
  }

  public async getAllVisitors(filters?: {
    status?: VisitorStatus;
    entryType?: VisitorEntryType;
    unitId?: string;
  }): Promise<Visitor[]> {
    try {
      let sql = `
        SELECT 
          v.id,
          v.unit_id AS unitId,
          un.unit_number AS unitNumber,
          un.block,
          v.host_user_id AS hostUserId,
          u.full_name AS hostName,
          v.visitor_name AS visitorName,
          v.visitor_phone AS visitorPhone,
          v.purpose,
          v.expected_arrival AS expectedArrival,
          v.status,
          v.access_code AS accessCode,
          v.entry_type AS entryType,
          v.visitor_type AS visitorType,
          v.vehicle_number AS vehicleNumber,
          v.notes,
          v.rejection_reason AS rejectionReason,
          v.approved_by_user_id AS approvedByUserId,
          v.approved_at AS approvedAt,
          v.valid_until AS validUntil,
          v.created_at AS createdAt,
          v.updated_at AS updatedAt
        FROM visitors v
        INNER JOIN units un ON v.unit_id = un.id
        INNER JOIN users u ON v.host_user_id = u.id
        WHERE 1=1
      `;
      const params: any[] = [];
      if (filters?.status) {
        sql += ` AND v.status = ?`;
        params.push(filters.status);
      }
      if (filters?.entryType) {
        sql += ` AND v.entry_type = ?`;
        params.push(filters.entryType);
      }
      if (filters?.unitId) {
        sql += ` AND v.unit_id = ?`;
        params.push(filters.unitId);
      }
      sql += ` ORDER BY v.expected_arrival DESC`;

      const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
      return rows as Visitor[];
    } catch {
      let filtered = [...DEV_SEED_VISITORS];
      if (filters?.status) {
        filtered = filtered.filter((v) => v.status === filters.status);
      }
      if (filters?.entryType) {
        filtered = filtered.filter((v) => v.entryType === filters.entryType);
      }
      if (filters?.unitId) {
        filtered = filtered.filter((v) => v.unitId === filters.unitId);
      }
      return filtered;
    }
  }

  public async getVisitorById(visitorId: string): Promise<Visitor | null> {
    try {
      const sql = `
        SELECT 
          v.id,
          v.unit_id AS unitId,
          un.unit_number AS unitNumber,
          un.block,
          v.host_user_id AS hostUserId,
          u.full_name AS hostName,
          v.visitor_name AS visitorName,
          v.visitor_phone AS visitorPhone,
          v.purpose,
          v.expected_arrival AS expectedArrival,
          v.status,
          v.access_code AS accessCode,
          v.entry_type AS entryType,
          v.visitor_type AS visitorType,
          v.vehicle_number AS vehicleNumber,
          v.notes,
          v.rejection_reason AS rejectionReason,
          v.approved_by_user_id AS approvedByUserId,
          v.approved_at AS approvedAt,
          v.valid_until AS validUntil,
          v.created_at AS createdAt,
          v.updated_at AS updatedAt
        FROM visitors v
        INNER JOIN units un ON v.unit_id = un.id
        INNER JOIN users u ON v.host_user_id = u.id
        WHERE v.id = ?
        LIMIT 1
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [visitorId]);
      return rows.length > 0 ? (rows[0] as Visitor) : null;
    } catch {
      return DEV_SEED_VISITORS.find((v) => v.id === visitorId) || null;
    }
  }

  public async createVisitor(data: {
    unitId: string;
    hostUserId: string;
    hostName?: string;
    unitNumber?: string;
    block?: string;
    visitorName: string;
    visitorPhone: string;
    purpose?: string;
    expectedArrival: string;
    entryType?: VisitorEntryType;
    visitorType?: VisitorType;
    vehicleNumber?: string;
    notes?: string;
  }): Promise<Visitor> {
    const id = `vis-${crypto.randomUUID()}`;
    const codeNumber = Math.floor(1000 + Math.random() * 9000);
    const accessCode = `GATE-${codeNumber}`;
    const now = new Date().toISOString();
    const entryType: VisitorEntryType = data.entryType || "PRE_APPROVED";
    const status: VisitorStatus = entryType === "PRE_APPROVED" ? "APPROVED" : "PENDING";
    const visitorType: VisitorType = data.visitorType || "GUEST";

    const visitor: Visitor = {
      id,
      unitId: data.unitId,
      unitNumber: data.unitNumber || "402",
      block: data.block || "Tower A",
      hostUserId: data.hostUserId,
      hostName: data.hostName || "Resident",
      visitorName: data.visitorName,
      visitorPhone: data.visitorPhone,
      purpose: data.purpose || "GUEST",
      expectedArrival: data.expectedArrival,
      status,
      accessCode,
      entryType,
      visitorType,
      vehicleNumber: data.vehicleNumber,
      notes: data.notes,
      createdAt: now,
      updatedAt: now
    };

    try {
      const sql = `
        INSERT INTO visitors (
          id, unit_id, host_user_id, visitor_name, visitor_phone, purpose,
          expected_arrival, status, access_code, entry_type, visitor_type,
          vehicle_number, notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await pool.execute(sql, [
        id,
        data.unitId,
        data.hostUserId,
        data.visitorName,
        data.visitorPhone,
        visitor.purpose,
        data.expectedArrival,
        visitor.status,
        accessCode,
        entryType,
        visitorType,
        data.vehicleNumber || null,
        data.notes || null
      ]);
      return visitor;
    } catch {
      DEV_SEED_VISITORS.unshift(visitor);
      return visitor;
    }
  }

  public async approveVisitor(
    visitorId: string,
    approvedByUserId: string
  ): Promise<Visitor | null> {
    const now = new Date().toISOString();
    try {
      const sql = `
        UPDATE visitors 
        SET status = 'APPROVED', approved_by_user_id = ?, approved_at = NOW(), updated_at = NOW()
        WHERE id = ? AND status = 'PENDING'
      `;
      await pool.execute(sql, [approvedByUserId, visitorId]);
      return await this.getVisitorById(visitorId);
    } catch {
      const found = DEV_SEED_VISITORS.find((v) => v.id === visitorId);
      if (found) {
        found.status = "APPROVED";
        found.approvedByUserId = approvedByUserId;
        found.approvedAt = now;
        found.updatedAt = now;
        return found;
      }
      return null;
    }
  }

  public async rejectVisitor(
    visitorId: string,
    rejectionReason: string,
    rejectedByUserId: string
  ): Promise<Visitor | null> {
    const now = new Date().toISOString();
    try {
      const sql = `
        UPDATE visitors 
        SET status = 'REJECTED', rejection_reason = ?, approved_by_user_id = ?, updated_at = NOW()
        WHERE id = ? AND status IN ('PENDING', 'APPROVED', 'AT_GATE')
      `;
      await pool.execute(sql, [rejectionReason, rejectedByUserId, visitorId]);
      return await this.getVisitorById(visitorId);
    } catch {
      const found = DEV_SEED_VISITORS.find((v) => v.id === visitorId);
      if (found) {
        found.status = "REJECTED";
        found.rejectionReason = rejectionReason;
        found.approvedByUserId = rejectedByUserId;
        found.updatedAt = now;
        return found;
      }
      return null;
    }
  }

  public async updateVisitorStatus(
    visitorId: string,
    status: VisitorStatus
  ): Promise<Visitor | null> {
    const now = new Date().toISOString();
    try {
      const sql = `UPDATE visitors SET status = ?, updated_at = NOW() WHERE id = ?`;
      await pool.execute(sql, [status, visitorId]);
      return await this.getVisitorById(visitorId);
    } catch {
      const found = DEV_SEED_VISITORS.find((v) => v.id === visitorId);
      if (found) {
        found.status = status;
        found.updatedAt = now;
        return found;
      }
      return null;
    }
  }
}

export const visitorRepository = new VisitorRepository();
