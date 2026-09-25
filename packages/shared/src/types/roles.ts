/**
 * PROVISIONAL USER ROLES NOTICE:
 * -------------------------------------------------------------
 * These role definitions are provisional design baselines derived from
 * the reference implementation and AMP-DEV-001 documentation.
 *
 * IMPORTANT:
 * - The final role model, permission hierarchy, and scope boundaries are
 *   PENDING SENIOR DEVELOPER CONFIRMATION.
 * - Do NOT use these types to enforce authorization or RBAC rules today.
 * - Authorization and RBAC enforcement will be introduced in subsequent milestones
 *   once the final specification is officially confirmed.
 */

export const PROVISIONAL_USER_ROLES = [
  "SUPER_ADMIN",
  "COMMITTEE_MEMBER",
  "RESIDENT_OWNER",
  "RESIDENT_TENANT",
  "SECURITY_GUARD",
  "MAINTENANCE_STAFF",
  "SERVICE_VENDOR"
] as const;

export type ProvisionalUserRole = (typeof PROVISIONAL_USER_ROLES)[number];

export interface RoleConfirmationStatus {
  isConfirmed: boolean;
  statusNotes: string;
}

export const ROLE_MODEL_STATUS: RoleConfirmationStatus = {
  isConfirmed: false,
  statusNotes: "Provisional baseline. Formal role hierarchy and permissions pending senior confirmation."
};
