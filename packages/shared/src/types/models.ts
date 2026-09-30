import { ProvisionalUserRole } from "./roles.js";

/**
 * Core Relational Data Models for Apartment Management Platform (MySQL 8.0+)
 */

export interface Role {
  id: number;
  code: ProvisionalUserRole;
  name: string;
  description: string;
  createdAt: string;
}

export interface Property {
  id: string; // UUID v4
  code: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  totalBlocks: number;
  totalUnits: number;
  createdAt: string;
  updatedAt: string;
}

export interface Unit {
  id: string; // UUID v4
  propertyId: string;
  unitNumber: string;
  block: string;
  floor: number;
  squareFeet?: number;
  unitType: "1BHK" | "2BHK" | "3BHK" | "4BHK" | "PENTHOUSE" | "COMMERCIAL";
  status: "OCCUPIED" | "VACANT" | "UNDER_MAINTENANCE";
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string; // UUID v4
  email: string;
  fullName: string;
  phoneNumber?: string;
  roleId: number;
  roleCode: ProvisionalUserRole;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserUnitAssignment {
  id: string; // UUID v4
  userId: string;
  unitId: string;
  assignmentType: "OWNER" | "TENANT" | "HOUSEHOLD_MEMBER";
  isPrimary: boolean;
  validFrom: string;
  validUntil?: string;
  status: "ACTIVE" | "PENDING_APPROVAL" | "TERMINATED";
  createdAt: string;
  updatedAt: string;
}
