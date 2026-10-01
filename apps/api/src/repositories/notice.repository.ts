import { RowDataPacket } from "mysql2";
import { pool } from "../config/database.js";
import { Notice } from "@apartment/shared";
import crypto from "crypto";

const DEV_SEED_NOTICES: Notice[] = [
  {
    id: "notice-00000000-0000-0000-0000-000000000001",
    propertyId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    title: "Scheduled Power Backup Drill",
    content: "Scheduled power backup drill this Saturday between 10:00 AM - 12:00 PM across all blocks.",
    category: "MAINTENANCE",
    priority: "NORMAL",
    authorId: "user-super-admin-000000000001",
    authorName: "Platform Super Admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "notice-00000000-0000-0000-0000-000000000002",
    propertyId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    title: "Clubhouse Deep Cleaning Notice",
    content: "Clubhouse and indoor games arena will be closed on Monday for monthly sanitization.",
    category: "AMENITY",
    priority: "LOW",
    authorId: "user-super-admin-000000000001",
    authorName: "Platform Super Admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export class NoticeRepository {
  public async getAll(): Promise<Notice[]> {
    return this.getRecentNotices(100);
  }

  public async getRecentNotices(limit: number = 10): Promise<Notice[]> {
    try {
      const sql = `
        SELECT 
          n.id,
          n.property_id AS propertyId,
          n.title,
          n.content,
          n.category,
          n.priority,
          n.author_id AS authorId,
          u.full_name AS authorName,
          n.created_at AS createdAt,
          n.updated_at AS updatedAt
        FROM notices n
        LEFT JOIN users u ON n.author_id = u.id
        ORDER BY n.created_at DESC
        LIMIT ?
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [limit]);
      return rows.map((r) => ({
        id: r.id,
        propertyId: r.propertyId,
        title: r.title,
        content: r.content,
        category: r.category,
        priority: r.priority,
        authorId: r.authorId,
        authorName: r.authorName || "Management",
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      }));
    } catch {
      return DEV_SEED_NOTICES.slice(0, limit);
    }
  }

  public async createNotice(data: {
    propertyId: string;
    title: string;
    content: string;
    category?: string;
    priority?: "LOW" | "NORMAL" | "URGENT";
    authorId: string;
  }): Promise<Notice> {
    const id = `notice-${crypto.randomUUID()}`;
    const category = data.category || "GENERAL";
    const priority = data.priority || "NORMAL";
    const now = new Date().toISOString();

    const notice: Notice = {
      id,
      propertyId: data.propertyId,
      title: data.title,
      content: data.content,
      category,
      priority,
      authorId: data.authorId,
      authorName: "Platform Super Admin",
      createdAt: now,
      updatedAt: now
    };

    try {
      const sql = `
        INSERT INTO notices (id, property_id, title, content, category, priority, author_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      await pool.execute(sql, [id, data.propertyId, data.title, data.content, category, priority, data.authorId]);
      return notice;
    } catch {
      DEV_SEED_NOTICES.unshift(notice);
      return notice;
    }
  }
}

export const noticeRepository = new NoticeRepository();
