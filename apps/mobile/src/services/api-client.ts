import { Platform } from "react-native";
import {
  LoginRequest,
  LoginResponseData,
  ApiSuccessResponse,
  ApiErrorResponse,
  HouseholdMember,
  Vehicle,
  VehicleType,
  ParkingSlot,
  Document,
  UserNotification
} from "@apartment/shared";
import { authStorage } from "./auth-storage";

// Determine API Base URL dynamically
const getBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // If testing on a physical iOS/Android device over hotspot/LAN
  if (Platform.OS !== "web") {
    return "http://10.190.221.208:4000/api";
  }
  return "http://localhost:4000/api";
};

export const API_BASE_URL = getBaseUrl();

/**
 * Perform an authenticated HTTP request.
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await authStorage.getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const json = await response.json();

  if (!response.ok) {
    const errorData = json as ApiErrorResponse;
    const message = errorData.error?.message || "An unexpected error occurred.";
    throw new Error(message);
  }

  return (json as ApiSuccessResponse<T>).data;
}

export const mobileApiClient = {
  /**
   * Authenticate tenant or owner resident with email & password.
   */
  async login(credentials: LoginRequest): Promise<LoginResponseData> {
    const data = await request<LoginResponseData>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    });

    if (data.token) {
      await authStorage.saveToken(data.token);
      await authStorage.saveUserData(JSON.stringify(data.user));
    }

    return data;
  },

  /**
   * Register a new resident account for approval (Phase 7).
   */
  async register(data: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
    role?: "RESIDENT_TENANT" | "RESIDENT_OWNER";
    unitId: string;
  }): Promise<{ message: string; userId: string; status: string }> {
    return await request<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  /**
   * Fetch authenticated resident unit and community profile.
   */
  async getTenantProfile(): Promise<any> {
    return await request<any>("/tenant/me", {
      method: "GET"
    });
  },

  /**
   * Log out resident, inform backend, and clear hardware encrypted storage.
   */
  async logout(): Promise<void> {
    try {
      await request<{ message: string }>("/auth/logout", {
        method: "POST"
      });
    } catch {
      // Always complete local credential deletion even if offline
    }
    await authStorage.clearAll();
  },

  /**
   * Fetch complete resident home dashboard data.
   */
  async getResidentHome(): Promise<any> {
    return await request<any>("/resident/home", { method: "GET" });
  },

  /**
   * Fetch resident profile.
   */
  async getProfile(): Promise<any> {
    return await request<any>("/resident/profile", { method: "GET" });
  },

  /**
   * Update permitted resident profile fields.
   */
  async updateProfile(data: { fullName?: string; phoneNumber?: string }): Promise<any> {
    return await request<any>("/resident/profile", {
      method: "PATCH",
      body: JSON.stringify(data)
    });
  },

  /**
   * Household Members APIs (Phase 2).
   */
  async getHousehold(): Promise<HouseholdMember[]> {
    return await request<HouseholdMember[]>("/resident/household", { method: "GET" });
  },

  async getHouseholdMembers(): Promise<HouseholdMember[]> {
    return await this.getHousehold();
  },

  async addHouseholdMember(data: {
    fullName: string;
    relationship: string;
    phoneNumber?: string;
    isEmergencyContact?: boolean;
  }): Promise<HouseholdMember> {
    return await request<HouseholdMember>("/resident/household", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  async deleteHouseholdMember(id: string): Promise<any> {
    return await request<any>(`/resident/household/${id}`, {
      method: "DELETE"
    });
  },

  /**
   * Vehicles & Parking APIs (Phase 3).
   */
  async getVehicles(): Promise<Vehicle[]> {
    return await request<Vehicle[]>("/resident/vehicles", { method: "GET" });
  },

  async addVehicle(data: {
    vehicleNumber: string;
    vehicleType: VehicleType;
    makeModel?: string;
    parkingSlotId?: string;
  }): Promise<Vehicle> {
    return await request<Vehicle>("/resident/vehicles", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  async deleteVehicle(id: string): Promise<any> {
    return await request<any>(`/resident/vehicles/${id}`, {
      method: "DELETE"
    });
  },

  async getParking(): Promise<ParkingSlot[]> {
    return await request<ParkingSlot[]>("/resident/parking", { method: "GET" });
  },

  async getMyParking(): Promise<ParkingSlot | null> {
    const list = await this.getParking();
    return list.length > 0 ? list[0] : null;
  },

  /**
   * Documents & Compliance APIs (Phase 5).
   */
  async getDocuments(): Promise<Document[]> {
    return await request<Document[]>("/documents", { method: "GET" });
  },

  /**
   * Notifications APIs (Phase 9).
   */
  async getNotifications(): Promise<UserNotification[]> {
    return await request<UserNotification[]>("/resident/notifications", { method: "GET" });
  },

  async markNotificationRead(id: string): Promise<any> {
    return await request<any>(`/resident/notifications/${id}/read`, {
      method: "PATCH"
    });
  },

  /**
   * Visitor Management APIs.
   */
  async getVisitors(): Promise<any[]> {
    return await request<any[]>("/visitors", { method: "GET" });
  },

  async createVisitor(data: {
    visitorName: string;
    visitorPhone: string;
    purpose?: string;
    expectedArrival: string;
  }): Promise<any> {
    return await request<any>("/visitors", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  async updateVisitorStatus(visitorId: string, status: string): Promise<any> {
    return await request<any>(`/visitors/${visitorId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
  },

  /**
   * Maintenance Management APIs (Phase 6 Attachments).
   */
  async getMaintenance(): Promise<any[]> {
    return await request<any[]>("/maintenance", { method: "GET" });
  },

  async createMaintenance(data: {
    category: string;
    title: string;
    description: string;
    priority?: string;
    attachments?: { fileName: string; fileUrl: string; fileSize: number; mimeType: string }[];
  }): Promise<any> {
    return await request<any>("/maintenance", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  async cancelMaintenance(id: string): Promise<any> {
    return await request<any>(`/maintenance/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "CANCELLED" })
    });
  },

  async addMaintenanceComment(id: string, comment: string): Promise<any> {
    return await request<any>(`/maintenance/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ comment })
    });
  },

  async uploadMaintenanceAttachment(ticketId: string, fileName: string, mimeType: string, fileData: string): Promise<any> {
    return await request<any>(`/maintenance/${ticketId}/attachments`, {
      method: "POST",
      body: JSON.stringify({ fileName, mimeType, fileData })
    });
  },

  /**
   * Dues APIs.
   */
  async getDues(): Promise<any[]> {
    return await request<any[]>("/dues", { method: "GET" });
  },

  async recordDuePayment(id: string, paymentReference?: string): Promise<any> {
    return await request<any>(`/dues/${id}/record-payment`, {
      method: "POST",
      body: JSON.stringify({ paymentReference: paymentReference || `MOB-PAY-${Date.now()}` })
    });
  },

  /**
   * Amenities & Bookings APIs.
   */
  async getAmenities(): Promise<any[]> {
    return await request<any[]>("/amenities", { method: "GET" });
  },

  async bookAmenity(id: string, startTime: string, endTime: string): Promise<any> {
    return await request<any>(`/amenities/${id}/bookings`, {
      method: "POST",
      body: JSON.stringify({ startTime, endTime })
    });
  },

  async cancelBooking(bookingId: string): Promise<any> {
    return await request<any>(`/bookings/${bookingId}`, {
      method: "DELETE"
    });
  }
};
