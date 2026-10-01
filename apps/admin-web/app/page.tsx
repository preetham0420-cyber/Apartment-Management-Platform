"use client";

import React, { useState, useEffect } from "react";
import { AdminShell } from "../components/AdminShell";
import { AdminLogin } from "../components/AdminLogin";
import { AuthUser } from "@apartment/shared";
import { ToastProvider } from "../components/Toast";

// Core Functional Admin Vertical Views
import { LiveDashboard } from "../components/LiveDashboard";
import { PropertiesManager } from "../components/PropertiesManager";
import { UnitsManager } from "../components/UnitsManager";
import { ResidentsManager } from "../components/ResidentsManager";
import { MaintenanceManager } from "../components/MaintenanceManager";
import { VisitorsManager } from "../components/VisitorsManager";
import { DuesManager } from "../components/DuesManager";
import { AmenitiesManager } from "../components/AmenitiesManager";
import { NoticePublisher } from "../components/NoticePublisher";
import { AuditLogViewer } from "../components/AuditLogViewer";
import { DocumentsManager } from "../components/DocumentsManager";
import { ReportsManager } from "../components/ReportsManager";

const USER_SESSION_KEY = "apartment_admin_session_user";
const TOKEN_SESSION_KEY = "apartment_admin_session_token";

export default function SuperAdminHomePage() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(null);

  // Restore authenticated session on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_SESSION_KEY);
      const storedToken = localStorage.getItem(TOKEN_SESSION_KEY);

      if (storedUser && storedToken) {
        const parsed = JSON.parse(storedUser) as AuthUser;
        if (parsed.role === "SUPER_ADMIN") {
          setSessionUser(parsed);
        } else {
          localStorage.removeItem(USER_SESSION_KEY);
          localStorage.removeItem(TOKEN_SESSION_KEY);
        }
      }
    } catch {
      localStorage.removeItem(USER_SESSION_KEY);
      localStorage.removeItem(TOKEN_SESSION_KEY);
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  const handleLoginSuccess = (user: AuthUser, token: string) => {
    try {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_SESSION_KEY, token);
    } catch {
      // Ignore localStorage errors
    }
    setSessionUser(user);
  };

  const handleLogout = () => {
    try {
      const token = localStorage.getItem(TOKEN_SESSION_KEY);
      if (token) {
        fetch("http://localhost:4000/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }).catch(() => {});
      }
      localStorage.removeItem(USER_SESSION_KEY);
      localStorage.removeItem(TOKEN_SESSION_KEY);
    } catch {
      // Ignore
    }
    setSessionUser(null);
  };

  // Auth checking state
  if (isCheckingAuth) {
    return (
      <div className="login-overlay">
        <div style={{ color: "#94a3b8", fontSize: "14px" }}>
          Verifying Super Admin session privileges...
        </div>
      </div>
    );
  }

  // Unauthenticated State: Show Super Admin Login Barrier
  if (!sessionUser) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  // Authenticated State: Show Super Admin Console with all 10 Real Verticals
  return (
    <ToastProvider>
      <AdminShell adminUser={sessionUser} onLogout={handleLogout}>
        {(activeTab, setActiveTab) => {
          switch (activeTab) {
            case "dashboard":
              return <LiveDashboard adminUser={sessionUser} onNavigateTab={setActiveTab} />;
            case "properties":
              return <PropertiesManager />;
            case "units":
              return <UnitsManager />;
            case "residents":
              return <ResidentsManager />;
            case "maintenance":
              return <MaintenanceManager />;
            case "visitors":
              return <VisitorsManager />;
            case "payments":
              return <DuesManager />;
            case "amenities":
              return <AmenitiesManager />;
            case "notices":
              return <NoticePublisher />;
            case "documents":
              return <DocumentsManager />;
            case "reports":
              return <ReportsManager />;
            case "audit":
              return <AuditLogViewer />;
            default:
              return <LiveDashboard adminUser={sessionUser} onNavigateTab={setActiveTab} />;
          }
        }}
      </AdminShell>
    </ToastProvider>
  );
}
