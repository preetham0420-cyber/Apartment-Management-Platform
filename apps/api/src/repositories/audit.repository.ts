import { RowDataPacket } from "mysql2";
import { pool } from "../config/database.js";
import { AuditLog } from "@apartment/shared";
import crypto from "crypto";

const DEV_SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: "audit-00000000-0000-0000-0000-000000000001",
    actorId: "user-super-admin-000000000001",
    actorEmail: "admin@community.local",
    action: "ADMIN_LOGIN",
    resourceType: "AUTH",
    resourceId: "user-super-admin-000000000001",
    details: { message: "Super admin session authenticated successfully." },
    ipAddress: "127.0.0.1",
    createdAt: new Date().toISOString()
  }
];

export class AuditRepository {
  public async logAction(data: {
    actorId?: string;
    actorEmail?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
  }): Promise<AuditLog> {
    const id = `audit-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const entry: AuditLog = {
      id,
      actorId: data.actorId,
      actorEmail: data.actorEmail,
      action: data.action,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      details: data.details,
      ipAddress: data.ipAddress,
      createdAt: now
    };

    try {
      const sql = `
        INSERT INTO audit_logs (id, actor_id, actor_email, action, resource_type, resource_id, details, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await pool.execute(sql, [
        id,
        data.actorId || null,
        data.actorEmail || null,
        data.action,
        data.resourceType,
        data.resourceId || null,
        data.details ? JSON.stringify(data.details) : null,
        data.ipAddress || null
      ]);
      return entry;
    } catch {
      DEV_SEED_AUDIT_LOGS.unshift(entry);
      return entry;
    }
  }

  public async getRecentLogs(limit: number = 50): Promise<AuditLog[]> {
    try {
      const sql = `
        SELECT 
          id, actor_id AS actorId, actor_email AS actorEmail,
          action, resource_type AS resourceType, resource_id AS resourceId,
          details, ip_address AS ipAddress, created_at AS createdAt
        FROM audit_logs
        ORDER BY created_at DESC
        LIMIT ?
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [limit]);
      return rows.map((r) => ({
        ...r,
        details: typeof r.details === "string" ? JSON.parse(r.details) : r.details
      })) as AuditLog[];
    } catch {
      return DEV_SEED_AUDIT_LOGS.slice(0, limit);
    }
  }
}

export const auditRepository = new AuditRepository();
