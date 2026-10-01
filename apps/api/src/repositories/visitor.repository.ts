import { RowDataPacket } from "mysql2";
import { pool } from "../config/database.js";
import { Visitor, VisitorStatus } from "@apartment/shared";
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
    status: "PRE_APPROVED",
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
    status: "AT_GATE",
    accessCode: "GATE-4022",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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

  public async getAllVisitors(): Promise<Visitor[]> {
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
          v.created_at AS createdAt,
          v.updated_at AS updatedAt
        FROM visitors v
        INNER JOIN units un ON v.unit_id = un.id
        INNER JOIN users u ON v.host_user_id = u.id
        ORDER BY v.expected_arrival DESC
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql);
      return rows as Visitor[];
    } catch {
      return [...DEV_SEED_VISITORS];
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
  }): Promise<Visitor> {
    const id = `vis-${crypto.randomUUID()}`;
    const codeNumber = Math.floor(1000 + Math.random() * 9000);
    const accessCode = `GATE-${codeNumber}`;
    const now = new Date().toISOString();

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
      status: "PRE_APPROVED",
      accessCode,
      createdAt: now,
      updatedAt: now
    };

    try {
      const sql = `
        INSERT INTO visitors (id, unit_id, host_user_id, visitor_name, visitor_phone, purpose, expected_arrival, status, access_code)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        accessCode
      ]);
      return visitor;
    } catch {
      DEV_SEED_VISITORS.unshift(visitor);
      return visitor;
    }
  }

  public async updateVisitorStatus(visitorId: string, status: VisitorStatus): Promise<Visitor | null> {
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
