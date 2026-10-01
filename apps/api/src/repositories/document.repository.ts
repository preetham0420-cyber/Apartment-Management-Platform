import { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../config/database.js";
import { Document, DocumentCategory, DocumentAccessLevel, ProvisionalUserRole } from "@apartment/shared";
import crypto from "crypto";

const DEV_SEED_DOCUMENTS: Document[] = [
  {
    id: "doc-00000000-0000-0000-0000-000000000001",
    propertyId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    title: "Greenfield Heights Association Bylaws (2024 Amendment)",
    description: "Official registered bylaws of the apartment owners association.",
    category: "APARTMENT_BYLAWS",
    fileUrl: "/documents/greenfield_bylaws_2024.pdf",
    fileSize: 1450200,
    mimeType: "application/pdf",
    uploadedByUserId: "user-super-admin-000000000001",
    accessLevel: "ALL_RESIDENTS",
    createdAt: new Date().toISOString()
  },
  {
    id: "doc-00000000-0000-0000-0000-000000000002",
    propertyId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    title: "State Fire Safety Compliance Certificate (NOC)",
    description: "Annual fire department inspection and clearance certificate.",
    category: "FIRE_SAFETY",
    fileUrl: "/documents/fire_noc_2026.pdf",
    fileSize: 892000,
    mimeType: "application/pdf",
    uploadedByUserId: "user-super-admin-000000000001",
    accessLevel: "ALL_RESIDENTS",
    createdAt: new Date().toISOString()
  },
  {
    id: "doc-00000000-0000-0000-0000-000000000003",
    propertyId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    title: "Schindler Lifts Annual Maintenance Contract (AMC)",
    description: "Elevator maintenance SLA and monthly technician inspection roster.",
    category: "LIFT_AMC",
    fileUrl: "/documents/schindler_amc_2026.pdf",
    fileSize: 540000,
    mimeType: "application/pdf",
    uploadedByUserId: "user-super-admin-000000000001",
    accessLevel: "ALL_RESIDENTS",
    createdAt: new Date().toISOString()
  },
  {
    id: "doc-00000000-0000-0000-0000-000000000004",
    propertyId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    title: "18th Annual General Body Meeting (AGM) Minutes",
    description: "Minutes of the AGM held on August 15th 2026 with audited accounts.",
    category: "AGM_MINUTES",
    fileUrl: "/documents/agm_minutes_aug_2026.pdf",
    fileSize: 2150000,
    mimeType: "application/pdf",
    uploadedByUserId: "user-super-admin-000000000001",
    accessLevel: "OWNERS_ONLY",
    createdAt: new Date().toISOString()
  },
  {
    id: "doc-00000000-0000-0000-0000-000000000005",
    propertyId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    title: "Master Security Vendor Contract (Confidential)",
    description: "Operational agreement with Apex Security Services.",
    category: "OTHER",
    fileUrl: "/documents/security_vendor_contract.pdf",
    fileSize: 3100000,
    mimeType: "application/pdf",
    uploadedByUserId: "user-super-admin-000000000001",
    accessLevel: "ADMIN_ONLY",
    createdAt: new Date().toISOString()
  }
];

export class DocumentRepository {
  public async getDocuments(role: ProvisionalUserRole): Promise<Document[]> {
    try {
      let allowedLevels: DocumentAccessLevel[] = ["ALL_RESIDENTS"];
      if (role === "SUPER_ADMIN" || role === "COMMITTEE_MEMBER") {
        allowedLevels = ["ALL_RESIDENTS", "OWNERS_ONLY", "ADMIN_ONLY"];
      } else if (role === "RESIDENT_OWNER") {
        allowedLevels = ["ALL_RESIDENTS", "OWNERS_ONLY"];
      }

      const placeholders = allowedLevels.map(() => "?").join(", ");
      const sql = `
        SELECT 
          id, property_id AS propertyId, title, description, category,
          file_url AS fileUrl, file_size AS fileSize, mime_type AS mimeType,
          uploaded_by_user_id AS uploadedByUserId, access_level AS accessLevel,
          created_at AS createdAt
        FROM documents
        WHERE access_level IN (${placeholders})
        ORDER BY created_at DESC
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, allowedLevels);
      return rows as Document[];
    } catch {
      if (role === "SUPER_ADMIN" || role === "COMMITTEE_MEMBER") {
        return [...DEV_SEED_DOCUMENTS];
      }
      if (role === "RESIDENT_OWNER") {
        return DEV_SEED_DOCUMENTS.filter(
          (d) => d.accessLevel === "ALL_RESIDENTS" || d.accessLevel === "OWNERS_ONLY"
        );
      }
      return DEV_SEED_DOCUMENTS.filter((d) => d.accessLevel === "ALL_RESIDENTS");
    }
  }

  public async getById(id: string): Promise<Document | null> {
    try {
      const sql = `
        SELECT 
          id, property_id AS propertyId, title, description, category,
          file_url AS fileUrl, file_size AS fileSize, mime_type AS mimeType,
          uploaded_by_user_id AS uploadedByUserId, access_level AS accessLevel,
          created_at AS createdAt
        FROM documents
        WHERE id = ?
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [id]);
      return (rows[0] as Document) || null;
    } catch {
      return DEV_SEED_DOCUMENTS.find((d) => d.id === id) || null;
    }
  }

  public async createDocument(data: {
    propertyId: string;
    title: string;
    description?: string;
    category: DocumentCategory;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedByUserId: string;
    accessLevel: DocumentAccessLevel;
  }): Promise<Document> {
    const id = `doc-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const entry: Document = {
      id,
      propertyId: data.propertyId,
      title: data.title,
      description: data.description,
      category: data.category,
      fileUrl: data.fileUrl,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      uploadedByUserId: data.uploadedByUserId,
      accessLevel: data.accessLevel,
      createdAt: now
    };

    try {
      const sql = `
        INSERT INTO documents (id, property_id, title, description, category, file_url, file_size, mime_type, uploaded_by_user_id, access_level)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await pool.execute<ResultSetHeader>(sql, [
        id,
        data.propertyId,
        data.title,
        data.description || null,
        data.category,
        data.fileUrl,
        data.fileSize,
        data.mimeType,
        data.uploadedByUserId,
        data.accessLevel
      ]);
      return entry;
    } catch {
      DEV_SEED_DOCUMENTS.unshift(entry);
      return entry;
    }
  }

  public async deleteDocument(id: string): Promise<boolean> {
    try {
      const sql = `DELETE FROM documents WHERE id = ?`;
      const [res] = await pool.execute<ResultSetHeader>(sql, [id]);
      return res.affectedRows > 0;
    } catch {
      const idx = DEV_SEED_DOCUMENTS.findIndex((d) => d.id === id);
      if (idx !== -1) {
        DEV_SEED_DOCUMENTS.splice(idx, 1);
        return true;
      }
      return false;
    }
  }

  public async getByRole(role: ProvisionalUserRole): Promise<Document[]> {
    return await this.getDocuments(role);
  }

  public async create(data: {
    propertyId: string;
    title: string;
    description?: string;
    category: DocumentCategory;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedByUserId: string;
    accessLevel?: DocumentAccessLevel;
  }): Promise<Document> {
    return await this.createDocument({
      ...data,
      accessLevel: data.accessLevel || "ALL_RESIDENTS"
    });
  }

  public async delete(id: string): Promise<boolean> {
    return await this.deleteDocument(id);
  }
}

export const documentRepository = new DocumentRepository();
