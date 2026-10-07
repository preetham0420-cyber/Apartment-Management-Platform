import {
  AdminDashboardData,
  UserSummary,
  MaintenanceRequest,
  MaintenanceStatus,
  Notice,
  AuditLog,
  Property,
  UnitDetail,
  Visitor,
  Due,
  Amenity,
  AmenityBooking,
  HouseholdMember,
  Vehicle,
  ParkingSlot,
  PendingOnboarding,
  Document,
  DocumentCategory,
  DocumentAccessLevel,
  OperationalReportsData,
  ApiSuccessResponse,
  ApiErrorResponse
} from "@apartment/shared";

function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined" && window.location.hostname) {
    return `http://${window.location.hostname}:4000/api`;
  }
  return "http://localhost:4000/api";
}

const TOKEN_SESSION_KEY = "apartment_admin_session_token";

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem(TOKEN_SESSION_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${getApiBaseUrl()}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...options.headers
  };

  const response = await fetch(url, { ...options, headers });
  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorData = json as ApiErrorResponse;
    const message = errorData.error?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  const successData = json as ApiSuccessResponse<T>;
  return successData.data;
}

export const adminApi = {
  getDashboard: () => request<AdminDashboardData>("/admin/dashboard"),
  getProperties: () => request<Property[]>("/admin/properties"),
  updateProperty: (id: string, data: Partial<Property>) =>
    request<Property>(`/admin/properties/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data)
    }),
  getUnits: () => request<UnitDetail[]>("/admin/units"),
  updateUnitStatus: (id: string, status: "OCCUPIED" | "VACANT" | "UNDER_MAINTENANCE") =>
    request<{ unitId: string; status: string }>(`/admin/units/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    }),
  getUnitHousehold: (unitId: string) =>
    request<HouseholdMember[]>(`/admin/units/${unitId}/household`),
  getResidents: () => request<UserSummary[]>("/admin/residents"),
  updateResidentStatus: (id: string, status: "ACTIVE" | "INACTIVE") =>
    request<UserSummary>(`/admin/residents/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive: status === "ACTIVE" })
    }),
  getPendingOnboardings: () => request<PendingOnboarding[]>("/admin/onboarding/pending"),
  approveOnboarding: (id: string) =>
    request<{ assignmentId: string; status: string }>(`/admin/onboarding/${id}/approve`, {
      method: "POST"
    }),
  rejectOnboarding: (id: string, reason: string) =>
    request<{ assignmentId: string; status: string; reason: string }>(`/admin/onboarding/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason })
    }),
  getMaintenance: () => request<MaintenanceRequest[]>("/admin/maintenance"),
  updateMaintenanceStatus: (id: string, status: MaintenanceStatus) =>
    request<MaintenanceRequest>(`/maintenance/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    }),
  addMaintenanceComment: (id: string, comment: string) =>
    request<{ id: string }>(`/maintenance/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ comment })
    }),
  getVisitors: () => request<Visitor[]>("/admin/visitors"),
  updateVisitorStatus: (id: string, status: string) =>
    request<Visitor>(`/visitors/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    }),
  getDues: () => request<Due[]>("/admin/dues"),
  recordPayment: (id: string, data: { amount?: number; paymentReference?: string }) =>
    request<Due>(`/dues/${id}/record-payment`, {
      method: "POST",
      body: JSON.stringify(data)
    }),
  getAmenities: () => request<Amenity[]>("/admin/amenities"),
  getAmenityBookings: () => request<AmenityBooking[]>("/admin/amenities/bookings"),
  cancelAmenityBooking: (id: string) =>
    request<{ bookingId: string }>(`/admin/amenities/bookings/${id}`, {
      method: "DELETE"
    }),
  getNotices: () => request<Notice[]>("/admin/notices"),
  createNotice: (data: { title: string; content: string; priority?: "LOW" | "NORMAL" | "URGENT"; category?: string }) =>
    request<Notice>("/admin/notices", {
      method: "POST",
      body: JSON.stringify(data)
    }),
  getVehicles: () => request<Vehicle[]>("/admin/vehicles"),
  getParking: () => request<ParkingSlot[]>("/admin/parking"),
  assignParkingSlot: (id: string, unitId: string | null) =>
    request<{ slotId: string; unitId: string | null; assigned: boolean }>(`/admin/parking/${id}/assign`, {
      method: "PATCH",
      body: JSON.stringify({ unitId })
    }),
  getDocuments: () => request<Document[]>("/admin/documents"),
  createDocument: (data: {
    propertyId?: string;
    title: string;
    description?: string;
    category: DocumentCategory;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    accessLevel?: DocumentAccessLevel;
  }) =>
    request<Document>("/admin/documents", {
      method: "POST",
      body: JSON.stringify(data)
    }),
  deleteDocument: (id: string) =>
    request<{ id: string; deleted: boolean }>(`/admin/documents/${id}`, {
      method: "DELETE"
    }),
  getOperationalReports: () => request<OperationalReportsData>("/admin/reports/operational"),
  getAuditLogs: () => request<AuditLog[]>("/admin/audit-logs")
};
