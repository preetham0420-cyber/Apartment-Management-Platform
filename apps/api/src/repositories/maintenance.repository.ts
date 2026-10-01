import { RowDataPacket } from "mysql2";
import { pool } from "../config/database.js";
import {
  MaintenanceRequest,
  MaintenanceComment,
  MaintenanceAttachment,
  MaintenanceStatus,
  MaintenancePriority,
  MaintenanceCategory
} from "@apartment/shared";
import crypto from "crypto";

const DEV_SEED_COMMENTS: MaintenanceComment[] = [
  {
    id: "comm-00000000-0000-0000-0000-000000000001",
    requestId: "maint-00000000-0000-0000-0000-000000000001",
    authorId: "user-super-admin-000000000001",
    authorName: "Platform Super Admin",
    authorRole: "SUPER_ADMIN",
    comment: "Technician assigned. Inspection scheduled for tomorrow morning.",
    createdAt: new Date().toISOString()
  }
];

const DEV_SEED_ATTACHMENTS: MaintenanceAttachment[] = [
  {
    id: "att-00000000-0000-0000-0000-000000000001",
    requestId: "maint-00000000-0000-0000-0000-000000000001",
    fileName: "sink_leak_photo.jpg",
    fileUrl: "/uploads/maintenance/sink_leak_photo.jpg",
    fileSize: 450200,
    mimeType: "image/jpeg",
    createdAt: new Date().toISOString()
  }
];

const DEV_SEED_MAINTENANCE: MaintenanceRequest[] = [
  {
    id: "maint-00000000-0000-0000-0000-000000000001",
    unitId: "u1111111-2222-3333-4444-555555555551",
    unitNumber: "402",
    block: "Tower A",
    residentId: "user-resident-tenant-00000002",
    residentName: "Preetham (Resident Tenant)",
    category: "PLUMBING",
    title: "Kitchen Sink Water Leakage",
    description: "Water is dripping slowly from the pipe under the main kitchen sink.",
    priority: "MEDIUM",
    status: "ASSIGNED",
    comments: [...DEV_SEED_COMMENTS],
    attachments: [...DEV_SEED_ATTACHMENTS],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export class MaintenanceRepository {
  public async getByResident(residentId: string): Promise<MaintenanceRequest[]> {
    try {
      const sql = `
        SELECT 
          m.id,
          m.unit_id AS unitId,
          un.unit_number AS unitNumber,
          un.block,
          m.resident_id AS residentId,
          u.full_name AS residentName,
          m.category,
          m.title,
          m.description,
          m.priority,
          m.status,
          m.assigned_to_user_id AS assignedToUserId,
          m.created_at AS createdAt,
          m.updated_at AS updatedAt
        FROM maintenance_requests m
        INNER JOIN units un ON m.unit_id = un.id
        INNER JOIN users u ON m.resident_id = u.id
        WHERE m.resident_id = ?
        ORDER BY m.created_at DESC
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [residentId]);
      const requests = rows as MaintenanceRequest[];
      for (const req of requests) {
        req.comments = await this.getComments(req.id);
        req.attachments = await this.getAttachments(req.id);
      }
      return requests;
    } catch {
      return DEV_SEED_MAINTENANCE.filter((m) => m.residentId === residentId);
    }
  }

  public async getAll(): Promise<MaintenanceRequest[]> {
    try {
      const sql = `
        SELECT 
          m.id,
          m.unit_id AS unitId,
          un.unit_number AS unitNumber,
          un.block,
          m.resident_id AS residentId,
          u.full_name AS residentName,
          m.category,
          m.title,
          m.description,
          m.priority,
          m.status,
          m.assigned_to_user_id AS assignedToUserId,
          m.created_at AS createdAt,
          m.updated_at AS updatedAt
        FROM maintenance_requests m
        INNER JOIN units un ON m.unit_id = un.id
        INNER JOIN users u ON m.resident_id = u.id
        ORDER BY m.created_at DESC
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql);
      const requests = rows as MaintenanceRequest[];
      for (const req of requests) {
        req.comments = await this.getComments(req.id);
        req.attachments = await this.getAttachments(req.id);
      }
      return requests;
    } catch {
      return [...DEV_SEED_MAINTENANCE];
    }
  }

  public async getById(id: string): Promise<MaintenanceRequest | null> {
    try {
      const sql = `
        SELECT 
          m.id,
          m.unit_id AS unitId,
          un.unit_number AS unitNumber,
          un.block,
          m.resident_id AS residentId,
          u.full_name AS residentName,
          m.category,
          m.title,
          m.description,
          m.priority,
          m.status,
          m.assigned_to_user_id AS assignedToUserId,
          m.created_at AS createdAt,
          m.updated_at AS updatedAt
        FROM maintenance_requests m
        INNER JOIN units un ON m.unit_id = un.id
        INNER JOIN users u ON m.resident_id = u.id
        WHERE m.id = ?
        LIMIT 1
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [id]);
      if (rows.length === 0) return null;
      const req = rows[0] as MaintenanceRequest;
      req.comments = await this.getComments(req.id);
      req.attachments = await this.getAttachments(req.id);
      return req;
    } catch {
      const found = DEV_SEED_MAINTENANCE.find((m) => m.id === id);
      return found ? {
        ...found,
        comments: DEV_SEED_COMMENTS.filter((c) => c.requestId === id),
        attachments: DEV_SEED_ATTACHMENTS.filter((a) => a.requestId === id)
      } : null;
    }
  }

  public async getComments(requestId: string): Promise<MaintenanceComment[]> {
    try {
      const sql = `
        SELECT 
          c.id,
          c.request_id AS requestId,
          c.author_id AS authorId,
          u.full_name AS authorName,
          r.code AS authorRole,
          c.comment,
          c.created_at AS createdAt
        FROM maintenance_comments c
        INNER JOIN users u ON c.author_id = u.id
        INNER JOIN roles r ON u.role_id = r.id
        WHERE c.request_id = ?
        ORDER BY c.created_at ASC
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [requestId]);
      return rows as MaintenanceComment[];
    } catch {
      return DEV_SEED_COMMENTS.filter((c) => c.requestId === requestId);
    }
  }

  public async getAttachments(requestId: string): Promise<MaintenanceAttachment[]> {
    try {
      const sql = `
        SELECT 
          id, request_id AS requestId, file_name AS fileName,
          file_url AS fileUrl, file_size AS fileSize, mime_type AS mimeType,
          created_at AS createdAt
        FROM maintenance_attachments
        WHERE request_id = ?
        ORDER BY created_at ASC
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [requestId]);
      return rows as MaintenanceAttachment[];
    } catch {
      return DEV_SEED_ATTACHMENTS.filter((a) => a.requestId === requestId);
    }
  }

  public async create(data: {
    unitId: string;
    unitNumber?: string;
    block?: string;
    residentId: string;
    residentName?: string;
    category: MaintenanceCategory;
    title: string;
    description: string;
    priority?: MaintenancePriority;
    attachments?: { fileName: string; fileUrl: string; fileSize: number; mimeType: string }[];
  }): Promise<MaintenanceRequest> {
    const id = `maint-${crypto.randomUUID()}`;
    const priority = data.priority || "MEDIUM";
    const now = new Date().toISOString();

    const createdAttachments: MaintenanceAttachment[] = (data.attachments || []).map((att) => ({
      id: `att-${crypto.randomUUID()}`,
      requestId: id,
      fileName: att.fileName,
      fileUrl: att.fileUrl,
      fileSize: att.fileSize,
      mimeType: att.mimeType,
      createdAt: now
    }));

    const request: MaintenanceRequest = {
      id,
      unitId: data.unitId,
      unitNumber: data.unitNumber || "402",
      block: data.block || "Tower A",
      residentId: data.residentId,
      residentName: data.residentName || "Resident",
      category: data.category,
      title: data.title,
      description: data.description,
      priority,
      status: "REPORTED",
      comments: [],
      attachments: createdAttachments,
      createdAt: now,
      updatedAt: now
    };

    try {
      const sql = `
        INSERT INTO maintenance_requests (id, unit_id, resident_id, category, title, description, priority, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'REPORTED')
      `;
      await pool.execute(sql, [id, data.unitId, data.residentId, data.category, data.title, data.description, priority]);

      if (createdAttachments.length > 0) {
        for (const att of createdAttachments) {
          const attSql = `
            INSERT INTO maintenance_attachments (id, request_id, file_name, file_url, file_size, mime_type)
            VALUES (?, ?, ?, ?, ?, ?)
          `;
          await pool.execute(attSql, [att.id, id, att.fileName, att.fileUrl, att.fileSize, att.mimeType]);
        }
      }
      return request;
    } catch {
      DEV_SEED_MAINTENANCE.unshift(request);
      DEV_SEED_ATTACHMENTS.push(...createdAttachments);
      return request;
    }
  }

  public async update(id: string, updates: {
    status?: MaintenanceStatus;
    priority?: MaintenancePriority;
    assignedToUserId?: string;
  }): Promise<MaintenanceRequest | null> {
    try {
      const sets: string[] = [];
      const values: any[] = [];
      if (updates.status) {
        sets.push("status = ?");
        values.push(updates.status);
      }
      if (updates.priority) {
        sets.push("priority = ?");
        values.push(updates.priority);
      }
      if (updates.assignedToUserId) {
        sets.push("assigned_to_user_id = ?");
        values.push(updates.assignedToUserId);
      }
      if (sets.length > 0) {
        sets.push("updated_at = NOW()");
        values.push(id);
        const sql = `UPDATE maintenance_requests SET ${sets.join(", ")} WHERE id = ?`;
        await pool.execute(sql, values);
      }
      return await this.getById(id);
    } catch {
      const found = DEV_SEED_MAINTENANCE.find((m) => m.id === id);
      if (found) {
        if (updates.status) found.status = updates.status;
        if (updates.priority) found.priority = updates.priority;
        found.updatedAt = new Date().toISOString();
        return found;
      }
      return null;
    }
  }

  public async addComment(requestId: string, authorId: string, authorName: string, authorRole: string, comment: string): Promise<MaintenanceComment> {
    const id = `comm-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const commentRecord: MaintenanceComment = {
      id,
      requestId,
      authorId,
      authorName,
      authorRole,
      comment,
      createdAt: now
    };

    try {
      const sql = `
        INSERT INTO maintenance_comments (id, request_id, author_id, comment)
        VALUES (?, ?, ?, ?)
      `;
      await pool.execute(sql, [id, requestId, authorId, comment]);
      return commentRecord;
    } catch {
      DEV_SEED_COMMENTS.push(commentRecord);
      const req = DEV_SEED_MAINTENANCE.find((m) => m.id === requestId);
      if (req) {
        if (!req.comments) req.comments = [];
        req.comments.push(commentRecord);
      }
      return commentRecord;
    }
  }

  public async addAttachment(
    requestId: string,
    attachment: { fileName: string; fileUrl: string; fileSize: number; mimeType: string }
  ): Promise<MaintenanceAttachment> {
    const id = `att-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const record: MaintenanceAttachment = {
      id,
      requestId,
      fileName: attachment.fileName,
      fileUrl: attachment.fileUrl,
      fileSize: attachment.fileSize,
      mimeType: attachment.mimeType,
      createdAt: now
    };

    try {
      const sql = `
        INSERT INTO maintenance_attachments (id, request_id, file_name, file_url, file_size, mime_type)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      await pool.execute(sql, [
        id,
        requestId,
        attachment.fileName,
        attachment.fileUrl,
        attachment.fileSize,
        attachment.mimeType
      ]);
      return record;
    } catch {
      DEV_SEED_ATTACHMENTS.push(record);
      const req = DEV_SEED_MAINTENANCE.find((m) => m.id === requestId);
      if (req) {
        if (!req.attachments) req.attachments = [];
        req.attachments.push(record);
      }
      return record;
    }
  }
}

export const maintenanceRepository = new MaintenanceRepository();
