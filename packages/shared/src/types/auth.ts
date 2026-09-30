import { ProvisionalUserRole } from "./roles.js";

/**
 * Authentication and Authorization Types
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: ProvisionalUserRole;
  phoneNumber?: string;
  isActive: boolean;
}

export interface UnitSummary {
  id: string;
  propertyId: string;
  propertyName: string;
  unitNumber: string;
  block: string;
  floor: number;
  assignmentType: "OWNER" | "TENANT" | "HOUSEHOLD_MEMBER";
}

export interface LoginResponseData {
  token: string;
  user: AuthUser;
  unit?: UnitSummary;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: ProvisionalUserRole;
  iat?: number;
  exp?: number;
}
