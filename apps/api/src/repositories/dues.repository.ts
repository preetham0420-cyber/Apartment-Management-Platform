import { RowDataPacket } from "mysql2";
import { pool } from "../config/database.js";
import { Due, DueStatus } from "@apartment/shared";

const DEV_SEED_DUES: Due[] = [
  {
    id: "due-00000000-0000-0000-0000-000000000001",
    unitId: "u1111111-2222-3333-4444-555555555551",
    unitNumber: "402",
    block: "Tower A",
    residentId: "user-resident-tenant-00000002",
    title: "September Maintenance & Water Charges",
    amount: 4850.0,
    dueDate: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString().split("T")[0],
    status: "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "due-00000000-0000-0000-0000-000000000004",
    unitId: "u1111111-2222-3333-4444-555555555552",
    unitNumber: "101",
    block: "Tower A",
    residentId: "user-resident-tenant-00000004",
    title: "October Society Maintenance & Sinking Fund",
    amount: 3850.0,
    dueDate: new Date(Date.now() + 12 * 24 * 3600 * 1000).toISOString().split("T")[0],
    status: "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "due-00000000-0000-0000-0000-000000000005",
    unitId: "u1111111-2222-3333-4444-555555555554",
    unitNumber: "304",
    block: "Tower B",
    residentId: "user-resident-tenant-00000005",
    title: "October Society Maintenance & Club Levy",
    amount: 4500.0,
    dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split("T")[0],
    status: "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export class DuesRepository {
  public async getByResident(residentId: string): Promise<Due[]> {
    try {
      const sql = `
        SELECT 
          d.id,
          d.unit_id AS unitId,
          un.unit_number AS unitNumber,
          un.block,
          d.resident_id AS residentId,
          d.title,
          d.amount,
          d.due_date AS dueDate,
          d.status,
          d.paid_at AS paidAt,
          d.payment_reference AS paymentReference,
          d.created_at AS createdAt,
          d.updated_at AS updatedAt
        FROM dues d
        INNER JOIN units un ON d.unit_id = un.id
        WHERE d.resident_id = ?
        ORDER BY d.due_date DESC
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [residentId]);
      return rows.map((r) => ({
        ...r,
        amount: Number(r.amount)
      })) as Due[];
    } catch {
      return DEV_SEED_DUES.filter((d) => d.residentId === residentId);
    }
  }

  public async getAll(): Promise<Due[]> {
    try {
      const sql = `
        SELECT 
          d.id,
          d.unit_id AS unitId,
          un.unit_number AS unitNumber,
          un.block,
          d.resident_id AS residentId,
          d.title,
          d.amount,
          d.due_date AS dueDate,
          d.status,
          d.paid_at AS paidAt,
          d.payment_reference AS paymentReference,
          d.created_at AS createdAt,
          d.updated_at AS updatedAt
        FROM dues d
        INNER JOIN units un ON d.unit_id = un.id
        ORDER BY d.due_date DESC
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql);
      return rows.map((r) => ({
        ...r,
        amount: Number(r.amount)
      })) as Due[];
    } catch {
      return [...DEV_SEED_DUES];
    }
  }

  public async getById(id: string): Promise<Due | null> {
    try {
      const sql = `
        SELECT 
          d.id,
          d.unit_id AS unitId,
          un.unit_number AS unitNumber,
          un.block,
          d.resident_id AS residentId,
          d.title,
          d.amount,
          d.due_date AS dueDate,
          d.status,
          d.paid_at AS paidAt,
          d.payment_reference AS paymentReference,
          d.created_at AS createdAt,
          d.updated_at AS updatedAt
        FROM dues d
        INNER JOIN units un ON d.unit_id = un.id
        WHERE d.id = ?
        LIMIT 1
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [id]);
      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        ...r,
        amount: Number(r.amount)
      } as Due;
    } catch {
      return DEV_SEED_DUES.find((d) => d.id === id) || null;
    }
  }

  public async recordPayment(id: string, paymentReference: string): Promise<Due | null> {
    const now = new Date().toISOString();
    try {
      const sql = `
        UPDATE dues 
        SET status = 'PAID', paid_at = NOW(), payment_reference = ?, updated_at = NOW() 
        WHERE id = ?
      `;
      await pool.execute(sql, [paymentReference, id]);
      return await this.getById(id);
    } catch {
      const due = DEV_SEED_DUES.find((d) => d.id === id);
      if (due) {
        due.status = "PAID";
        due.paidAt = now;
        due.paymentReference = paymentReference;
        due.updatedAt = now;
        return due;
      }
      return null;
    }
  }
}

export const duesRepository = new DuesRepository();
