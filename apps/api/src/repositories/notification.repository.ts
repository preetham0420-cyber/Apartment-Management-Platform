import { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../config/database.js";
import { UserNotification } from "@apartment/shared";
import crypto from "crypto";

const DEV_SEED_NOTIFICATIONS: UserNotification[] = [
  {
    id: "notif-00000000-0000-0000-0000-00000001",
    userId: "user-resident-tenant-00000002",
    title: "Guest Checked In at Main Gate",
    body: "Your visitor Ramesh Kumar has passed Gate 1 and is en route to Flat 402.",
    type: "VISITOR",
    referenceId: "vis-00000000-0000-0000-0000-000000000001",
    isRead: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "notif-00000000-0000-0000-0000-00000002",
    userId: "user-resident-tenant-00000002",
    title: "Maintenance Request Assigned",
    body: "Plumber Ravi Kumar has been assigned to your ticket #MNT-001 (Leaking pipe).",
    type: "MAINTENANCE",
    referenceId: "req-00000000-0000-0000-0000-000000000001",
    isRead: true,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "notif-00000000-0000-0000-0000-00000003",
    userId: "user-resident-tenant-00000002",
    title: "Maintenance Dues Invoice Generated",
    body: "Invoice for October 2026 maintenance dues (Rs. 4,500) has been generated.",
    type: "PAYMENT",
    referenceId: "due-00000000-0000-0000-0000-000000000001",
    isRead: false,
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: "notif-00000000-0000-0000-0000-00000004",
    userId: "user-resident-owner-000000000003",
    title: "Annual General Body Meeting Scheduled",
    body: "AGM meeting notice and agenda have been published to Document Centre.",
    type: "NOTICE",
    referenceId: "doc-00000000-0000-0000-0000-000000000004",
    isRead: false,
    createdAt: new Date().toISOString()
  }
];

export class NotificationRepository {
  public async getByUserId(userId: string): Promise<UserNotification[]> {
    try {
      const sql = `
        SELECT 
          id, user_id AS userId, title, body, type,
          reference_id AS referenceId, is_read AS isRead, created_at AS createdAt
        FROM user_notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [userId]);
      return rows.map((r) => ({
        ...r,
        isRead: Boolean(r.isRead)
      })) as UserNotification[];
    } catch {
      return DEV_SEED_NOTIFICATIONS.filter((n) => n.userId === userId);
    }
  }

  public async markAsRead(id: string, userId: string): Promise<boolean> {
    try {
      const sql = `UPDATE user_notifications SET is_read = TRUE WHERE id = ? AND user_id = ?`;
      const [res] = await pool.execute<ResultSetHeader>(sql, [id, userId]);
      return res.affectedRows > 0;
    } catch {
      const notif = DEV_SEED_NOTIFICATIONS.find((n) => n.id === id && n.userId === userId);
      if (notif) {
        notif.isRead = true;
        return true;
      }
      return false;
    }
  }

  public async create(data: {
    userId: string;
    title: string;
    body: string;
    type: "VISITOR" | "MAINTENANCE" | "PAYMENT" | "NOTICE" | "SYSTEM";
    referenceId?: string;
  }): Promise<UserNotification> {
    const id = `notif-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const entry: UserNotification = {
      id,
      userId: data.userId,
      title: data.title,
      body: data.body,
      type: data.type,
      referenceId: data.referenceId,
      isRead: false,
      createdAt: now
    };

    try {
      const sql = `
        INSERT INTO user_notifications (id, user_id, title, body, type, reference_id, is_read)
        VALUES (?, ?, ?, ?, ?, ?, FALSE)
      `;
      await pool.execute<ResultSetHeader>(sql, [
        id,
        data.userId,
        data.title,
        data.body,
        data.type,
        data.referenceId || null
      ]);
      return entry;
    } catch {
      DEV_SEED_NOTIFICATIONS.unshift(entry);
      return entry;
    }
  }
}

export const notificationRepository = new NotificationRepository();
