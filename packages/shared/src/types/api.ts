/**
 * Standard REST/JSON API response contracts for the Apartment Management Platform.
 */

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    version: string;
    [key: string]: unknown;
  };
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
  meta?: {
    timestamp: string;
    path?: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface HealthCheckData {
  service: string;
  status: "healthy" | "degraded" | "unhealthy";
  version: string;
  uptimeSeconds: number;
  timestamp: string;
  environment: string;
}
