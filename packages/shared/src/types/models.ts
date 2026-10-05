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
  contactEmail?: string;
  contactPhone?: string;
  emergencyPhone?: string;
  rulesSummary?: string;
  paymentInstructions?: string;
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
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notice {
  id: string;
  propertyId: string;
  title: string;
  content: string;
  category: string;
  priority: "LOW" | "NORMAL" | "URGENT";
  authorId: string;
  authorName?: string;
  createdAt: string;
  updatedAt?: string;
}

export type VisitorStatus = "PRE_APPROVED" | "AT_GATE" | "CHECKED_IN" | "CHECKED_OUT" | "REJECTED" | "CANCELLED";

export interface Visitor {
  id: string;
  unitId: string;
  unitNumber?: string;
  block?: string;
  hostUserId: string;
  hostName?: string;
  visitorName: string;
  visitorPhone: string;
  purpose: string;
  expectedArrival: string;
  status: VisitorStatus;
  accessCode: string;
  createdAt: string;
  updatedAt?: string;
}

export interface VisitorEvent {
  id: string;
  visitorId: string;
  eventType: "ENTRY" | "EXIT" | "OVERSTAY_ALERT";
  gateNumber: string;
  recordedByUserId?: string;
  createdAt: string;
}

export type MaintenanceCategory =
  | "PLUMBING"
  | "ELECTRICAL"
  | "CARPENTRY"
  | "APPLIANCE"
  | "COMMON_AREA"
  | "OTHER";

export type MaintenancePriority = "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";

export type MaintenanceStatus =
  | "REPORTED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "CANCELLED";

export interface MaintenanceAttachment {
  id: string;
  requestId: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

export interface MaintenanceComment {
  id: string;
  requestId: string;
  authorId: string;
  authorName?: string;
  authorRole?: string;
  comment: string;
  createdAt: string;
}

export interface MaintenanceRequest {
  id: string;
  unitId: string;
  unitNumber?: string;
  block?: string;
  residentId: string;
  residentName?: string;
  category: MaintenanceCategory;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  assignedToUserId?: string;
  attachments?: MaintenanceAttachment[];
  comments?: MaintenanceComment[];
  createdAt: string;
  updatedAt: string;
}

export type DueStatus = "PENDING" | "PAID" | "OVERDUE";

export interface Due {
  id: string;
  unitId: string;
  unitNumber?: string;
  block?: string;
  residentId: string;
  residentName?: string;
  title: string;
  amount: number;
  dueDate: string;
  status: DueStatus;
  paidAt?: string;
  paymentReference?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Amenity {
  id: string;
  propertyId: string;
  name: string;
  description?: string;
  capacity: number;
  rules?: string;
  openTime: string;
  closeTime: string;
  isActive: boolean;
  createdAt: string;
}

export interface AmenityBooking {
  id: string;
  amenityId: string;
  amenityName?: string;
  residentId: string;
  residentName?: string;
  unitId: string;
  startTime: string;
  endTime: string;
  status: "CONFIRMED" | "CANCELLED";
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId?: string;
  actorEmail?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown> | string;
  ipAddress?: string;
  createdAt: string;
}

export interface UserSummary {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: ProvisionalUserRole;
  status: "ACTIVE" | "INACTIVE";
  unitId?: string;
  unitNumber?: string;
  block?: string;
  createdAt?: string;
}

export interface UnitDetail extends Unit {
  propertyName?: string;
  residentName?: string;
  residentEmail?: string;
}

export interface HouseholdMember {
  id: string;
  unitId: string;
  residentUserId: string;
  fullName: string;
  relationship: string;
  phoneNumber?: string;
  isEmergencyContact: boolean;
  createdAt: string;
}

export interface ParkingSlot {
  id: string;
  propertyId: string;
  slotNumber: string;
  levelLocation: string;
  unitId?: string;
  unitNumber?: string;
  createdAt: string;
}

export type VehicleType = "TWO_WHEELER" | "FOUR_WHEELER" | "EV";

export interface Vehicle {
  id: string;
  unitId: string;
  unitNumber?: string;
  userId: string;
  userName?: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  makeModel?: string;
  parkingSlotId?: string;
  parkingSlotNumber?: string;
  createdAt: string;
}

export type DocumentCategory =
  | "APARTMENT_BYLAWS"
  | "FIRE_SAFETY"
  | "LIFT_AMC"
  | "AGM_MINUTES"
  | "FINANCIAL"
  | "FINANCIAL_AUDIT"
  | "OTHER";

export type DocumentAccessLevel = "ALL_RESIDENTS" | "OWNERS_ONLY" | "ADMIN_ONLY";

export interface Document {
  id: string;
  propertyId: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedByUserId: string;
  accessLevel: DocumentAccessLevel;
  createdAt: string;
  updatedAt?: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: "VISITOR" | "MAINTENANCE" | "PAYMENT" | "NOTICE" | "SYSTEM";
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface PendingOnboarding {
  assignmentId: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  unitId: string;
  unitNumber: string;
  block: string;
  role: ProvisionalUserRole;
  requestedAt: string;
  status: "PENDING_APPROVAL" | "ACTIVE" | "TERMINATED";
}

export interface OperationalReportsData {
  financial: {
    totalBilled: number;
    totalCollected: number;
    totalPending: number;
    collectionRate: string;
    duesByStatus: { pending: number; paid: number; overdue: number };
    recentPayments: Due[];
  };
  maintenance: {
    totalRequests: number;
    resolvedRequests: number;
    inProgressRequests: number;
    avgResolutionHours: number;
    categoryBreakdown: Record<string, number>;
  };
  visitors: {
    totalVisitors: number;
    checkedInCount: number;
    checkedOutCount: number;
    peakArrivalHour: string;
  };
  occupancy: {
    totalUnits: number;
    occupiedUnits: number;
    vacantUnits: number;
    underMaintenanceUnits: number;
    occupancyRate: string;
  };
}

export interface AdminDashboardData {
  stats: {
    totalResidents: number;
    totalUnits?: number;
    occupancyRate?: string;
    pendingMaintenance: number;
    pendingDuesCount: number;
    activeVisitors?: number;
    activeNotices: number;
    amenityBookingsCount?: number;
  };
  systemMetrics?: {
    totalProperties: number;
    totalUnits: number;
    occupiedUnits: number;
    occupancyRate: string;
    collectionEfficiency: string;
    totalResidentsCount: number;
    openMaintenanceCount: number;
    activeVisitorsCount: number;
    activeSecurityIncidents: number;
  };
  recentAuditLogs: AuditLog[];
  recentActivity?: AuditLog[];
  openTickets?: MaintenanceRequest[];
  activeVisitors?: Visitor[];
  recentNotices?: Notice[];
}
