"use client";

import React, { useState, useEffect } from "react";
import { AdminShell } from "../components/AdminShell";
import { MetricCard } from "../components/MetricCard";
import { StatusPill } from "../components/StatusPill";
import { AdminLogin } from "../components/AdminLogin";
import { ROLE_MODEL_STATUS, AuthUser } from "@apartment/shared";

interface ModuleSummary {
  title: string;
  category: string;
  metric: string;
  metricLabel: string;
  statusText: string;
  statusTone: "blue" | "green" | "orange" | "red" | "violet";
  description: string;
}

const moduleCatalog: Record<string, ModuleSummary> = {
  residents: {
    title: "Residents & Homes Directory",
    category: "Community Records",
    metric: "248 Units",
    metricLabel: "226 Occupied (91.1%)",
    statusText: "648 Registered",
    statusTone: "blue",
    description: "Overview of flat owners, registered tenants, approved family members, and parking slots.",
  },
  rentals: {
    title: "Rental & Lease Management",
    category: "Tenancy Oversight",
    metric: "87 Leases",
    metricLabel: "6 Renewals Pending",
    statusText: "Active Agreements",
    statusTone: "violet",
    description: "Tracking lease agreements, move-in/out checklists, and owner-tenant relationship records.",
  },
  maintenance: {
    title: "Maintenance Operations Centre",
    category: "Facility Management",
    metric: "18 Open Tickets",
    metricLabel: "5 High Priority",
    statusText: "Assigned to Vendors",
    statusTone: "orange",
    description: "Service ticket workflow across plumbing, electrical, carpentry, lifts, and common areas.",
  },
  payments: {
    title: "Payments & Financial Ledger",
    category: "Accounting",
    metric: "₹18.4L Collected",
    metricLabel: "86% Collection Rate",
    statusText: "22 Pending Homes",
    statusTone: "green",
    description: "Maintenance dues tracking, offline receipt recording, and community expense ledger.",
  },
  visitors: {
    title: "Gate Operations & Visitor Register",
    category: "Security Desk",
    metric: "12 Inside",
    metricLabel: "46 Total Entries Today",
    statusText: "Gate 1 Active",
    statusTone: "blue",
    description: "Live entry/exit monitoring for guests, delivery agents, cabs, and daily service staff.",
  },
  cctv: {
    title: "CCTV & Security Infrastructure",
    category: "Perimeter Security",
    metric: "33 / 36 Online",
    metricLabel: "1 Offline (Basement B2)",
    statusText: "28 Days Retention",
    statusTone: "red",
    description: "Camera network uptime, NVR storage metrics, and authorized surveillance audit logs.",
  },
  amenities: {
    title: "Shared Amenities & Facilities",
    category: "Recreation",
    metric: "4 Facilities",
    metricLabel: "Community Hall, Courts, Pool",
    statusText: "Slots Available",
    statusTone: "blue",
    description: "Managing clubhouse reservation calendars, slots, maintenance windows, and usage policies.",
  },
  chat: {
    title: "Administrative Communications",
    category: "Support & Desk",
    metric: "6 Channels",
    metricLabel: "Helpdesk, Security, Maintenance",
    statusText: "Direct Channels",
    statusTone: "violet",
    description: "Official broadcast channels and role-restricted service desks for community support.",
  },
  notices: {
    title: "Community Notice Board",
    category: "Announcements",
    metric: "7 Notices",
    metricLabel: "2 Emergency Updates",
    statusText: "94% Reach",
    statusTone: "orange",
    description: "Broadcasting official circulars, AGM meeting announcements, and residential polls.",
  },
  staff: {
    title: "Staff Attendance & Vendor Roster",
    category: "Operations",
    metric: "34 On Duty",
    metricLabel: "42 Approved Partners",
    statusText: "96% Attendance",
    statusTone: "green",
    description: "Security guard shifts, housekeeping schedules, and contractor AMC renewal tracking.",
  },
  documents: {
    title: "Compliance & Document Centre",
    category: "Legal Records",
    metric: "389 Files",
    metricLabel: "Bylaws, AMCs, Certificates",
    statusText: "Audit Compliant",
    statusTone: "blue",
    description: "Central repository for fire safety certificates, association bylaws, and meeting minutes.",
  },
  reports: {
    title: "Executive Reports & Audit Logs",
    category: "Intelligence",
    metric: "38 Reports",
    metricLabel: "Generated This Month",
    statusText: "Audit Trail Ready",
    statusTone: "violet",
    description: "Financial reconciliations, maintenance SLA statistics, and security audit histories.",
  },
};

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

  // Authenticated State: Show Super Admin Console
  return (
    <AdminShell adminUser={sessionUser} onLogout={handleLogout}>
      {(activeTab) => {
        // If viewing a specific module tab:
        if (activeTab !== "dashboard" && moduleCatalog[activeTab]) {
          const mod = moduleCatalog[activeTab];
          return (
            <>
              {/* Notice Banner */}
              <div className="notice-banner">
                <strong>Super Admin Executive View:</strong> Viewing <strong>{mod.title}</strong> module. Logged in as <strong>{sessionUser.email}</strong> with <strong>{sessionUser.role}</strong> authority.
              </div>

              {/* Module Header Metrics */}
              <section className="grid-cards">
                <MetricCard label="Module Classification" value={mod.category} tone={mod.statusTone} />
                <MetricCard label="Primary Metric" value={mod.metric} note={mod.metricLabel} tone={mod.statusTone} />
                <MetricCard label="Operational Status" value={mod.statusText} tone={mod.statusTone} />
                <MetricCard label="Architecture Tier" value="Next.js 16" note="Super Admin Web Console" tone="blue" />
              </section>

              {/* Module Details Panel */}
              <section className="panel">
                <div className="panel-header">
                  <div>
                    <h2 className="panel-title">{mod.title} — Operational Layout</h2>
                    <p className="panel-subtitle">{mod.description}</p>
                  </div>
                  <StatusPill tone={mod.statusTone}>{mod.statusText}</StatusPill>
                </div>

                <div className="module-overview-grid">
                  <div className="module-card">
                    <h3>Workflow Definition</h3>
                    <p>Designed to interact directly with the Node 22 / Express 5 API and MySQL backend once the data persistence layer is connected.</p>
                    <StatusPill tone="blue">API Boundary Ready</StatusPill>
                  </div>

                  <div className="module-card">
                    <h3>Security & Authorization</h3>
                    <p>Access restricted exclusively to authorized Super Admin accounts. Role boundaries are verified on the server side.</p>
                    <StatusPill tone="green">Session Verified (SUPER_ADMIN)</StatusPill>
                  </div>

                  <div className="module-card">
                    <h3>Reference Alignment</h3>
                    <p>Preserves all layout concepts, terminology, and operational counters established in the approved reference UI package.</p>
                    <StatusPill tone="green">Design Baseline Verified</StatusPill>
                  </div>
                </div>
              </section>
            </>
          );
        }

        // Default: Full Dashboard Overview
        return (
          <>
            {/* Active Session Notice Banner */}
            <div className="notice-banner">
              <strong>Super Admin Authenticated Session:</strong> Welcome back, <strong>{sessionUser.fullName}</strong> ({sessionUser.email}). Server-side authorization active.
            </div>

            {/* Quick KPI Overview */}
            <section className="grid-cards">
              <MetricCard label="Total Homes" value="248" note="12 blocks / 226 occupied" tone="blue" />
              <MetricCard label="Occupancy Rate" value="91.1%" note="161 owners • 87 tenants" tone="green" />
              <MetricCard label="Open Maintenance" value="18" note="5 high priority tickets" tone="orange" />
              <MetricCard label="August Collection" value="₹18.4L" note="86% collected • ₹3.1L pending" tone="violet" />
            </section>

            {/* Platform Tiers Status Panel */}
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">Apartment Management Platform — Architecture Skeleton</h2>
                  <p className="panel-subtitle">Day 4 authenticated foundation on Next.js 16.2.6 & React 19.2.6</p>
                </div>
                <StatusPill tone="green">Authenticated & Protected</StatusPill>
              </div>

              <table className="info-table">
                <thead>
                  <tr>
                    <th>Platform Tier</th>
                    <th>Technology Stack</th>
                    <th>Repository Path</th>
                    <th>Day 4 Security Scope</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Super Admin Web</strong></td>
                    <td>Next.js 16.2.6 / React 19.2.6 / TypeScript</td>
                    <td><code>apps/admin-web</code></td>
                    <td>Admin Login Barrier & Session Management</td>
                    <td><StatusPill tone="green">Protected</StatusPill></td>
                  </tr>
                  <tr>
                    <td><strong>Tenant Mobile</strong></td>
                    <td>React Native 0.86 / Expo SDK 57 / TypeScript</td>
                    <td><code>apps/mobile</code></td>
                    <td>Native Login & Hardware SecureStore</td>
                    <td><StatusPill tone="green">Protected</StatusPill></td>
                  </tr>
                  <tr>
                    <td><strong>Backend REST API</strong></td>
                    <td>Node.js 22 LTS / Express 5 / TypeScript</td>
                    <td><code>apps/api</code></td>
                    <td>JWT Auth, Zod Validation, RBAC Guards</td>
                    <td><StatusPill tone="blue">Server Enforced</StatusPill></td>
                  </tr>
                  <tr>
                    <td><strong>Shared Package</strong></td>
                    <td>TypeScript Contracts</td>
                    <td><code>packages/shared</code></td>
                    <td>Auth Contracts, DTOs & Relational Models</td>
                    <td><StatusPill tone="violet">Compiled</StatusPill></td>
                  </tr>
                  <tr>
                    <td><strong>Database Storage</strong></td>
                    <td>MySQL 8.0+</td>
                    <td><code>database/migrations</code></td>
                    <td>Pure SQL Schema & Parameterized Queries</td>
                    <td><StatusPill tone="green">SQL Migration Ready</StatusPill></td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Operations Summary Cards */}
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">Operations & Facilities Quick Matrix</h2>
                  <p className="panel-subtitle">High-level operational summary across apartment systems</p>
                </div>
              </div>

              <div className="module-overview-grid">
                <div className="module-card">
                  <div>
                    <h3>Gate & Visitor Traffic</h3>
                    <p>12 visitors currently on premises across Gate 1 and Gate 2. 46 total entries processed today.</p>
                  </div>
                  <StatusPill tone="blue">Live Gate Monitor</StatusPill>
                </div>

                <div className="module-card">
                  <div>
                    <h3>CCTV Camera Health</h3>
                    <p>33 of 36 cameras online. 1 camera in Basement B2 offline for 31 minutes. AMC contract current.</p>
                  </div>
                  <StatusPill tone="red">1 Attention Required</StatusPill>
                </div>

                <div className="module-card">
                  <div>
                    <h3>Staff & Vendor Duty</h3>
                    <p>34 service staff on duty across morning and general shifts. 96% recorded attendance today.</p>
                  </div>
                  <StatusPill tone="green">All Shifts Covered</StatusPill>
                </div>

                <div className="module-card">
                  <div>
                    <h3>Accounts & Billing</h3>
                    <p>August maintenance collection reached ₹18,42,650 out of ₹21,49,200 total billed amount.</p>
                  </div>
                  <StatusPill tone="violet">86% Reconciled</StatusPill>
                </div>
              </div>
            </section>
          </>
        );
      }}
    </AdminShell>
  );
}
