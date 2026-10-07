"use client";

import React, { useState } from "react";
import { AuthUser, LoginResponseData, ApiErrorResponse, ApiSuccessResponse } from "@apartment/shared";
import { ShieldIcon, AlertTriangleIcon } from "./icons";

interface AdminLoginProps {
  onLoginSuccess: (user: AuthUser, token: string) => void;
}

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const apiHost = typeof window !== "undefined" && window.location.hostname ? window.location.hostname : "localhost";
      const apiUrl = process.env.NEXT_PUBLIC_API_URL 
        ? `${process.env.NEXT_PUBLIC_API_URL}/auth/login`
        : `http://${apiHost}:4000/api/auth/login`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim(),
          password
        })
      });

      const json = await response.json();

      if (!response.ok) {
        const errorData = json as ApiErrorResponse;
        throw new Error(errorData.error?.message || "Invalid credentials.");
      }

      const successData = json as ApiSuccessResponse<LoginResponseData>;
      const { user, token } = successData.data;

      // Enforce frontend role check matching backend RBAC
      if (user.role !== "SUPER_ADMIN") {
        throw new Error(
          `Access Denied: Role '${user.role}' is not authorized to access the Super Admin Console.`
        );
      }

      onLoginSuccess(user, token);
    } catch (error) {
      const err = error as Error;
      setErrorMessage(err.message || "Failed to authenticate.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setEmail("admin@community.local");
    setPassword("Admin@12345");
    setErrorMessage(null);
  };

  const handleFillDemoTenant = () => {
    setEmail("preetham@community.local");
    setPassword("Tenant1@12345");
    setErrorMessage(null);
  };

  return (
    <div className="login-overlay">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="login-shield-badge">
            <ShieldIcon size={26} color="#159A72" />
          </div>
          <h1 className="login-title">Super Admin Console</h1>
          <p className="login-subtitle">
            Apartment Management Platform • Executive Access
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="login-error-alert" role="alert">
            <span className="error-icon"><AlertTriangleIcon size={16} color="#D95757" /></span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="admin-email">Administrator Email</label>
            <input
              id="admin-email"
              type="email"
              placeholder="e.g. admin@community.local"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              required
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="admin-password">Secure Password</label>
            <input
              id="admin-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="login-submit-button"
            disabled={isLoading}
          >
            {isLoading ? "Authenticating & Verifying Privileges..." : "Sign In to Super Admin Console"}
          </button>
        </form>

        {/* Demo Credentials Section */}
        <div className="demo-credentials-box">
          <div className="demo-divider">
            <span>DEVELOPMENT TEST ACCOUNTS</span>
          </div>

          <div className="demo-buttons-row">
            <button
              type="button"
              className="demo-btn-primary"
              onClick={handleFillDemoAdmin}
              disabled={isLoading}
            >
              👑 Fill Super Admin (admin@community.local)
            </button>
            <button
              type="button"
              className="demo-btn-secondary"
              onClick={handleFillDemoTenant}
              disabled={isLoading}
              title="Test RBAC rejection (Resident Tenant should receive 403 Forbidden)"
            >
              🚫 Fill Resident Tenant (Tests 403 Access Denied)
            </button>
          </div>
        </div>

        {/* Security Footer */}
        <div className="login-security-footer">
          <span>🔒 Enforced with server-side role authorization & encrypted JWT sessions</span>
        </div>
      </div>
    </div>
  );
}
