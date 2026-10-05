import { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../config/database.js";
import { Property, UnitDetail } from "@apartment/shared";

const DEV_SEED_PROPERTIES: Property[] = [
  {
    id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    code: "GREENFIELD",
    name: "Greenfield Heights",
    addressLine1: "100 Outer Ring Road",
    addressLine2: "Near Tech Park",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560103",
    totalBlocks: 4,
    totalUnits: 120,
    contactEmail: "office@greenfield.local",
    contactPhone: "+91 80 2841 5500",
    emergencyPhone: "+91 80 9999 1122",
    rulesSummary: "1. Quiet hours observed 10:00 PM to 06:00 AM.\n2. Visitor vehicles permitted only in designated guest bays.\n3. Clubhouse booking requires 24h advance reservation.\n4. Waste segregation (Dry, Wet, Sanitary) is mandatory.",
    paymentInstructions: "Transfer maintenance dues via NEFT/UPI to Greenfield Association: HDFC A/C 50200012345678, IFSC: HDFC0001234 or UPI ID: greenfieldrwa@hdfcbank",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const DEV_SEED_UNITS: UnitDetail[] = [
  {
    id: "u1111111-2222-3333-4444-555555555551",
    propertyId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    propertyName: "Greenfield Heights",
    unitNumber: "402",
    block: "Tower A",
    floor: 4,
    squareFeet: 1450,
    unitType: "3BHK",
    status: "OCCUPIED",
    residentName: "Preetham (Resident Tenant)",
    residentEmail: "tenant1@community.local",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "u1111111-2222-3333-4444-555555555552",
    propertyId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    propertyName: "Greenfield Heights",
    unitNumber: "101",
    block: "Tower A",
    floor: 1,
    squareFeet: 1100,
    unitType: "2BHK",
    status: "OCCUPIED",
    residentName: "Ananya Sharma (Resident Tenant)",
    residentEmail: "tenant2@community.local",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "u1111111-2222-3333-4444-555555555553",
    propertyId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    propertyName: "Greenfield Heights",
    unitNumber: "205",
    block: "Tower B",
    floor: 2,
    squareFeet: 1850,
    unitType: "4BHK",
    status: "OCCUPIED",
    residentName: "Vikramaditya (Resident Owner)",
    residentEmail: "owner@community.local",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "u1111111-2222-3333-4444-555555555554",
    propertyId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    propertyName: "Greenfield Heights",
    unitNumber: "304",
    block: "Tower B",
    floor: 3,
    squareFeet: 1400,
    unitType: "3BHK",
    status: "OCCUPIED",
    residentName: "Rahul Verma (Resident Tenant)",
    residentEmail: "tenant3@community.local",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "u1111111-2222-3333-4444-555555555555",
    propertyId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    propertyName: "Greenfield Heights",
    unitNumber: "501",
    block: "Tower C",
    floor: 5,
    squareFeet: 2200,
    unitType: "PENTHOUSE",
    status: "UNDER_MAINTENANCE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export class PropertyRepository {
  public async getAllProperties(): Promise<Property[]> {
    try {
      const sql = `
        SELECT 
          id, code, name, address_line1 AS addressLine1, address_line2 AS addressLine2,
          city, state, postal_code AS postalCode, total_blocks AS totalBlocks,
          total_units AS totalUnits, contact_email AS contactEmail,
          contact_phone AS contactPhone, emergency_phone AS emergencyPhone,
          rules_summary AS rulesSummary, payment_instructions AS paymentInstructions,
          created_at AS createdAt, updated_at AS updatedAt
        FROM properties
        ORDER BY name ASC
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql);
      return rows as Property[];
    } catch {
      return [...DEV_SEED_PROPERTIES];
    }
  }

  public async getPropertyById(id: string): Promise<Property | null> {
    try {
      const sql = `
        SELECT 
          id, code, name, address_line1 AS addressLine1, address_line2 AS addressLine2,
          city, state, postal_code AS postalCode, total_blocks AS totalBlocks,
          total_units AS totalUnits, contact_email AS contactEmail,
          contact_phone AS contactPhone, emergency_phone AS emergencyPhone,
          rules_summary AS rulesSummary, payment_instructions AS paymentInstructions,
          created_at AS createdAt, updated_at AS updatedAt
        FROM properties
        WHERE id = ?
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [id]);
      return (rows[0] as Property) || null;
    } catch {
      return DEV_SEED_PROPERTIES.find((p) => p.id === id) || null;
    }
  }

  public async updateProperty(id: string, updates: Partial<Property>): Promise<Property | null> {
    try {
      const fields: string[] = [];
      const values: any[] = [];

      if (updates.name !== undefined) {
        fields.push("name = ?");
        values.push(updates.name);
      }
      if (updates.addressLine1 !== undefined) {
        fields.push("address_line1 = ?");
        values.push(updates.addressLine1);
      }
      if (updates.addressLine2 !== undefined) {
        fields.push("address_line2 = ?");
        values.push(updates.addressLine2);
      }
      if (updates.city !== undefined) {
        fields.push("city = ?");
        values.push(updates.city);
      }
      if (updates.state !== undefined) {
        fields.push("state = ?");
        values.push(updates.state);
      }
      if (updates.postalCode !== undefined) {
        fields.push("postal_code = ?");
        values.push(updates.postalCode);
      }
      if (updates.contactEmail !== undefined) {
        fields.push("contact_email = ?");
        values.push(updates.contactEmail);
      }
      if (updates.contactPhone !== undefined) {
        fields.push("contact_phone = ?");
        values.push(updates.contactPhone);
      }
      if (updates.emergencyPhone !== undefined) {
        fields.push("emergency_phone = ?");
        values.push(updates.emergencyPhone);
      }
      if (updates.rulesSummary !== undefined) {
        fields.push("rules_summary = ?");
        values.push(updates.rulesSummary);
      }
      if (updates.paymentInstructions !== undefined) {
        fields.push("payment_instructions = ?");
        values.push(updates.paymentInstructions);
      }

      if (fields.length > 0) {
        values.push(id);
        const sql = `UPDATE properties SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        await pool.execute<ResultSetHeader>(sql, values);
      }

      return await this.getPropertyById(id);
    } catch {
      const prop = DEV_SEED_PROPERTIES.find((p) => p.id === id);
      if (prop) {
        Object.assign(prop, updates, { updatedAt: new Date().toISOString() });
        return { ...prop };
      }
      return null;
    }
  }

  public async getAllUnits(): Promise<UnitDetail[]> {
    try {
      const sql = `
        SELECT 
          un.id,
          un.property_id AS propertyId,
          p.name AS propertyName,
          un.unit_number AS unitNumber,
          un.block,
          un.floor,
          un.square_feet AS squareFeet,
          un.unit_type AS unitType,
          un.status,
          un.created_at AS createdAt,
          un.updated_at AS updatedAt,
          u.full_name AS residentName,
          u.email AS residentEmail
        FROM units un
        INNER JOIN properties p ON un.property_id = p.id
        LEFT JOIN user_unit_assignments a ON a.unit_id = un.id AND a.status = 'ACTIVE'
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY un.block ASC, un.unit_number ASC
      `;
      const [rows] = await pool.execute<RowDataPacket[]>(sql);
      return rows as UnitDetail[];
    } catch {
      return [...DEV_SEED_UNITS];
    }
  }

  public async updateUnitStatus(
    unitId: string,
    status: "OCCUPIED" | "VACANT" | "UNDER_MAINTENANCE"
  ): Promise<boolean> {
    try {
      const sql = `UPDATE units SET status = ? WHERE id = ?`;
      const [res] = await pool.execute<ResultSetHeader>(sql, [status, unitId]);
      return res.affectedRows > 0;
    } catch {
      const unit = DEV_SEED_UNITS.find((u) => u.id === unitId);
      if (unit) {
        unit.status = status;
        return true;
      }
      return false;
    }
  }
}

export const propertyRepository = new PropertyRepository();
