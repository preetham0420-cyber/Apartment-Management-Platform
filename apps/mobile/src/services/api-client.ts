import { Platform } from "react-native";
import { LoginRequest, LoginResponseData, ApiSuccessResponse, ApiErrorResponse } from "@apartment/shared";
import { authStorage } from "./auth-storage";

// Determine API Base URL dynamically
const getBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // If testing on a physical iOS/Android device over hotspot/LAN
  if (Platform.OS !== "web") {
    return "http://172.20.10.2:4000/api";
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
   * Authenticate tenant resident with email & password.
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
   * Fetch authenticated resident unit and community profile.
   */
  async getTenantProfile(): Promise<any> {
    return await request<any>("/tenant/me", {
      method: "GET"
    });
  },

  /**
   * Log out resident and clear encrypted storage.
   */
  async logout(): Promise<void> {
    await authStorage.clearAll();
  }
};
