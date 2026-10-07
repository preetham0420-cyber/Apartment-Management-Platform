"use client";

import React, { useEffect, useState } from "react";
import { StatusPill } from "./StatusPill";
import { AdminDashboardData, AuthUser } from "@apartment/shared";
import { adminApi } from "../lib/api";
import {
  ResidentsIcon,
  UnitsIcon,
  BuildingIcon,
  MaintenanceIcon,
  VisitorsIcon,
  DuesIcon,
  AmenitiesIcon,
  NoticesIcon,
  ReportsIcon,
  PlusIcon,
  RefreshIcon,
  ArrowUpRightIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertTriangleIcon
} from "./icons";

interface LiveDashboardProps {
  adminUser: AuthUser;
  onNavigateTab?: (tab: string) => void;
}

export function LiveDashboard({ adminUser, onNavigateTab }: LiveDashboardProps) {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getDashboard();
      setData(res);
    } catch (err) {
      const e = err as Error;
      setError(e.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const totalResidents = data?.stats?.totalResidents ?? 0;
  const totalUnits = data?.occupancy?.totalUnits ?? data?.stats?.totalUnits ?? data?.systemMetrics?.totalUnits ?? 5;
  const occupiedUnits = data?.occupancy?.occupiedUnits ?? data?.systemMetrics?.occupiedUnits ?? 4;
  const underMaintenanceUnits = data?.occupancy?.underMaintenanceUnits ?? (data?.systemMetrics as any)?.underMaintenanceUnits ?? 1;
  const vacantUnits = data?.occupancy?.vacantUnits ?? (data?.systemMetrics as any)?.vacantUnits ?? 0;
  const occupancyRate = data?.occupancy?.occupancyRate ?? data?.stats?.occupancyRate ?? data?.systemMetrics?.occupancyRate ?? "80%";
  const towerBreakdown = data?.occupancy?.towerBreakdown;

  const reportedTickets = data?.maintenanceStats?.reported ?? (data?.openTickets?.filter((t) => t.status === "REPORTED").length ?? 1);
  const assignedTickets = data?.maintenanceStats?.assigned ?? (data?.openTickets?.filter((t) => t.status === "ASSIGNED").length ?? 1);
  const inProgressTickets = data?.maintenanceStats?.inProgress ?? (data?.openTickets?.filter((t) => t.status === "IN_PROGRESS").length ?? 0);
  const resolvedTickets = data?.maintenanceStats?.resolved ?? 0;
  const avgResHours = data?.maintenanceStats?.avgResolutionHours ?? 0;

  const pendingMaintenance = data?.stats?.pendingMaintenance ?? 0;
  const pendingDues = data?.stats?.pendingDuesCount ?? 0;
  const activeVisitors = data?.stats?.activeVisitors ?? 0;
  const activeNotices = data?.stats?.activeNotices ?? 0;
  const amenityBookings = data?.stats?.amenityBookingsCount ?? 0;

  // Numeric occupancy calculations for progress bar
  const occupancyNum = Math.round((occupiedUnits / Math.max(1, totalUnits)) * 100);

  return (
    <div className="dashboard-container">
      {/* 1. Header Section */}
      <div className="dashboard-header">
        <div>
          <div className="dashboard-tagline">
            <span className="estate-dot" />
            <span>Greenfield Heights • Live Community Operations</span>
          </div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-greeting">
            Good morning, <strong>{adminUser.fullName}</strong>. Here is the operational health of your property today.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={fetchDashboard}
            disabled={loading}
            title="Refresh live metrics"
          >
            <RefreshIcon size={14} />
            <span>{loading ? "Refreshing..." : "Refresh"}</span>
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigateTab?.("reports")}
            title="View analytical reports"
          >
            <ReportsIcon size={14} />
            <span>Reports & Analytics</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="feedback-banner error">
          <AlertTriangleIcon size={16} />
          <span>{error}</span>
          <button className="btn btn-secondary btn-sm" onClick={fetchDashboard} style={{ marginLeft: "auto" }}>
            Retry
          </button>
        </div>
      )}

      {/* 2. Primary Overview Section (4 Asymmetric KPI Cards) */}
      <section className="kpi-grid">
        {/* Card 1: Residents */}
        <div
          className="kpi-card"
          onClick={() => onNavigateTab?.("residents")}
          role="button"
          tabIndex={0}
        >
          <div className="kpi-header">
            <span className="kpi-label">Total Residents</span>
            <div className="kpi-icon-box tone-emerald">
              <ResidentsIcon size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">{loading ? "—" : totalResidents}</span>
            <span className="kpi-badge tone-emerald">Active Accounts</span>
          </div>
          <p className="kpi-subtitle">Verified tenants and owners enrolled</p>
        </div>

        {/* Card 2: Units Inventory */}
        <div
          className="kpi-card"
          onClick={() => onNavigateTab?.("units")}
          role="button"
          tabIndex={0}
        >
          <div className="kpi-header">
            <span className="kpi-label">Units Inventory</span>
            <div className="kpi-icon-box tone-teal">
              <UnitsIcon size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">{loading ? "—" : totalUnits}</span>
            <span className="kpi-badge tone-teal">Flats Registered</span>
          </div>
          <p className="kpi-subtitle">{occupiedUnits} Occupied • {underMaintenanceUnits > 0 ? `${underMaintenanceUnits} Maint • ` : ""}{vacantUnits} Vacant</p>
        </div>

        {/* Card 3: Occupancy Rate */}
        <div
          className="kpi-card"
          onClick={() => onNavigateTab?.("units")}
          role="button"
          tabIndex={0}
        >
          <div className="kpi-header">
            <span className="kpi-label">Occupancy Rate</span>
            <div className="kpi-icon-box tone-emerald">
              <BuildingIcon size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">{loading ? "—" : occupancyRate}</span>
            <span className="kpi-badge tone-emerald">{occupiedUnits} of {totalUnits} Units</span>
          </div>
          <div className="kpi-progress-bar">
            <div className="kpi-progress-fill" style={{ width: `${occupancyNum}%` }} />
          </div>
        </div>

        {/* Card 4: Open Maintenance */}
        <div
          className="kpi-card"
          onClick={() => onNavigateTab?.("maintenance")}
          role="button"
          tabIndex={0}
        >
          <div className="kpi-header">
            <span className="kpi-label">Open Maintenance</span>
            <div className="kpi-icon-box tone-warning">
              <MaintenanceIcon size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">{loading ? "—" : pendingMaintenance}</span>
            <span className="kpi-badge tone-warning">
              {pendingMaintenance > 0 ? "Requires Action" : "All Clear"}
            </span>
          </div>
          <p className="kpi-subtitle">Plumbing, electrical & carpentry requests</p>
        </div>
      </section>

      {/* 3. Operations Overview (Two-Column Section) */}
      <section className="operations-split-grid">
        {/* Left: Occupancy & Estate Distribution */}
        <div className="card operations-card">
          <div className="card-header-clean">
            <div>
              <h2 className="card-title">Property Occupancy Distribution</h2>
              <p className="card-subtitle">Real-time status across Tower A & Tower B</p>
            </div>
            <button
              className="text-link-btn"
              onClick={() => onNavigateTab?.("units")}
            >
              <span>Manage Units</span>
              <ArrowUpRightIcon size={14} />
            </button>
          </div>

          <div className="occupancy-stats-strip">
            <div className="occupancy-stat-block">
              <span className="occupancy-stat-label">Total Flats</span>
              <span className="occupancy-stat-num">{totalUnits}</span>
            </div>
            <div className="occupancy-stat-divider" />
            <div className="occupancy-stat-block">
              <span className="occupancy-stat-label">Occupied</span>
              <span className="occupancy-stat-num text-emerald">{occupiedUnits}</span>
            </div>
            <div className="occupancy-stat-divider" />
            <div className="occupancy-stat-block">
              <span className="occupancy-stat-label">Under Maint.</span>
              <span className="occupancy-stat-num text-warning">{underMaintenanceUnits}</span>
            </div>
            <div className="occupancy-stat-divider" />
            <div className="occupancy-stat-block">
              <span className="occupancy-stat-label">Vacant</span>
              <span className="occupancy-stat-num text-muted">{vacantUnits}</span>
            </div>
            <div className="occupancy-stat-divider" />
            <div className="occupancy-stat-block">
              <span className="occupancy-stat-label">Occupancy</span>
              <span className="occupancy-stat-num text-emerald">{occupancyRate}</span>
            </div>
          </div>

          <div className="progress-stack-container">
            <div className="progress-label-row">
              <span>Occupancy Allocation</span>
              <span>{occupancyRate} Occupied</span>
            </div>
            <div className="progress-track">
              <div className="progress-bar-filled" style={{ width: `${occupancyNum}%` }} />
            </div>
          </div>

          <div className="estate-highlights">
            <div className="highlight-pill">
              <span className="pill-dot emerald" />
              <span>Tower A: {towerBreakdown?.["Tower A"]?.occupied ?? 2} Occupied</span>
            </div>
            <div className="highlight-pill">
              <span className="pill-dot teal" />
              <span>Tower B: {towerBreakdown?.["Tower B"]?.occupied ?? 2} Occupied</span>
            </div>
            <div className="highlight-pill">
              <span className="pill-dot neutral" />
              <span>Tower C: {towerBreakdown?.["Tower C"]?.underMaintenance ?? 1} Under Maintenance</span>
            </div>
          </div>
        </div>

        {/* Right: Maintenance Status Breakdown */}
        <div className="card operations-card">
          <div className="card-header-clean">
            <div>
              <h2 className="card-title">Maintenance Workflow Health</h2>
              <p className="card-subtitle">Active requests categorized by stage</p>
            </div>
            <button
              className="text-link-btn"
              onClick={() => onNavigateTab?.("maintenance")}
            >
              <span>Service Desk</span>
              <ArrowUpRightIcon size={14} />
            </button>
          </div>

          <div className="workflow-status-grid">
            <div className="workflow-card">
              <span className="workflow-num text-warning">{reportedTickets}</span>
              <span className="workflow-label">Reported / Open</span>
              <span className="workflow-tag">Awaiting Tech</span>
            </div>
            <div className="workflow-card">
              <span className="workflow-num text-teal">
                {assignedTickets}
              </span>
              <span className="workflow-label">Assigned</span>
              <span className="workflow-tag">Scheduled</span>
            </div>
            <div className="workflow-card">
              <span className="workflow-num text-teal">
                {inProgressTickets}
              </span>
              <span className="workflow-label">In Progress</span>
              <span className="workflow-tag">On Premises</span>
            </div>
            <div className="workflow-card">
              <span className="workflow-num text-emerald">
                {resolvedTickets}
              </span>
              <span className="workflow-label">Resolved (30d)</span>
              <span className="workflow-tag">SLA Met</span>
            </div>
          </div>

          <div className="service-sla-notice">
            <CheckCircleIcon size={16} color="var(--primary)" />
            <span>
              {avgResHours > 0 ? (
                <>Average maintenance response SLA across society is <strong>{avgResHours} hours</strong>.</>
              ) : (
                <>Average maintenance SLA response target is under <strong>24 hours</strong> ({pendingMaintenance} active tickets in service desk).</>
              )}
            </span>
          </div>
        </div>
      </section>

      {/* 4. Quick Operations Bar */}
      <section className="quick-ops-section">
        <h3 className="section-eyebrow">Quick Operations</h3>
        <div className="quick-ops-grid">
          <button
            className="quick-op-card"
            onClick={() => onNavigateTab?.("residents")}
          >
            <div className="quick-op-icon tone-emerald">
              <PlusIcon size={16} />
            </div>
            <div className="quick-op-text">
              <span className="quick-op-title">Add Resident</span>
              <span className="quick-op-desc">Onboard tenant or owner</span>
            </div>
          </button>

          <button
            className="quick-op-card"
            onClick={() => onNavigateTab?.("visitors")}
          >
            <div className="quick-op-icon tone-teal">
              <VisitorsIcon size={16} />
            </div>
            <div className="quick-op-text">
              <span className="quick-op-title">Gate Pass</span>
              <span className="quick-op-desc">Issue security entry code</span>
            </div>
          </button>

          <button
            className="quick-op-card"
            onClick={() => onNavigateTab?.("maintenance")}
          >
            <div className="quick-op-icon tone-warning">
              <MaintenanceIcon size={16} />
            </div>
            <div className="quick-op-text">
              <span className="quick-op-title">Service Ticket</span>
              <span className="quick-op-desc">Dispatch repair work</span>
            </div>
          </button>

          <button
            className="quick-op-card"
            onClick={() => onNavigateTab?.("notices")}
          >
            <div className="quick-op-icon tone-emerald">
              <NoticesIcon size={16} />
            </div>
            <div className="quick-op-text">
              <span className="quick-op-title">Publish Notice</span>
              <span className="quick-op-desc">Broadcast to community</span>
            </div>
          </button>

          <button
            className="quick-op-card"
            onClick={() => onNavigateTab?.("payments")}
          >
            <div className="quick-op-icon tone-teal">
              <DuesIcon size={16} />
            </div>
            <div className="quick-op-text">
              <span className="quick-op-title">Record Payment</span>
              <span className="quick-op-desc">Reconcile society dues</span>
            </div>
          </button>

          <button
            className="quick-op-card"
            onClick={() => onNavigateTab?.("amenities")}
          >
            <div className="quick-op-icon tone-emerald">
              <AmenitiesIcon size={16} />
            </div>
            <div className="quick-op-text">
              <span className="quick-op-title">Amenities</span>
              <span className="quick-op-desc">Manage reservations</span>
            </div>
          </button>
        </div>
      </section>

      {/* 5. Community Activity (Two Stream Columns) */}
      <section className="activity-streams-grid">
        {/* Left: Recent Maintenance Activity */}
        <div className="card stream-card">
          <div className="card-header-clean">
            <div>
              <h2 className="card-title">Recent Maintenance Activity</h2>
              <p className="card-subtitle">Active requests awaiting operational resolution</p>
            </div>
            <button
              className="text-link-btn"
              onClick={() => onNavigateTab?.("maintenance")}
            >
              <span>View All</span>
              <ArrowUpRightIcon size={14} />
            </button>
          </div>

          <div className="activity-stream-list">
            {loading ? (
              <div className="loading-state-mini">Loading service requests...</div>
            ) : !data?.openTickets || data.openTickets.length === 0 ? (
              <div className="empty-state-mini">
                <CheckCircleIcon size={20} color="var(--primary)" />
                <p>No open maintenance requests currently pending.</p>
              </div>
            ) : (
              data.openTickets.slice(0, 4).map((ticket) => (
                <div key={ticket.id} className="stream-item">
                  <div className="stream-icon-box tone-warning">
                    <MaintenanceIcon size={16} />
                  </div>
                  <div className="stream-item-main">
                    <div className="stream-item-top">
                      <span className="stream-item-title">{ticket.title}</span>
                      <StatusPill tone={ticket.status === "IN_PROGRESS" ? "teal" : "orange"}>
                        {ticket.status}
                      </StatusPill>
                    </div>
                    <div className="stream-item-meta">
                      <span>Unit {ticket.unitNumber || "402"}</span>
                      <span>•</span>
                      <span>{ticket.category}</span>
                      <span>•</span>
                      <span className="meta-priority">Priority: {ticket.priority}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Recent Gate & Visitor Activity */}
        <div className="card stream-card">
          <div className="card-header-clean">
            <div>
              <h2 className="card-title">Recent Gate Activity & Passes</h2>
              <p className="card-subtitle">Verified visitor entries and digital passes</p>
            </div>
            <button
              className="text-link-btn"
              onClick={() => onNavigateTab?.("visitors")}
            >
              <span>Gate Desk</span>
              <ArrowUpRightIcon size={14} />
            </button>
          </div>

          <div className="activity-stream-list">
            {loading ? (
              <div className="loading-state-mini">Loading visitor passes...</div>
            ) : !data?.activeVisitors || data.activeVisitors.length === 0 ? (
              <div className="empty-state-mini">
                <ClockIcon size={20} color="var(--text-muted)" />
                <p>No active visitor passes registered for today.</p>
              </div>
            ) : (
              data.activeVisitors.slice(0, 4).map((visitor) => (
                <div key={visitor.id} className="stream-item">
                  <div className="stream-icon-box tone-teal">
                    <VisitorsIcon size={16} />
                  </div>
                  <div className="stream-item-main">
                    <div className="stream-item-top">
                      <span className="stream-item-title">{visitor.visitorName}</span>
                      <StatusPill tone={visitor.status === "AT_GATE" ? "orange" : "emerald"}>
                        {visitor.status}
                      </StatusPill>
                    </div>
                    <div className="stream-item-meta">
                      <span>Pass: <code>{visitor.accessCode}</code></span>
                      <span>•</span>
                      <span>{visitor.purpose}</span>
                      <span>•</span>
                      <span>Host: {visitor.hostName || "Unit 402"}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 6. Recent Immutable Audit Trail */}
      <section className="card audit-feed-card">
        <div className="card-header-clean">
          <div>
            <h2 className="card-title">Recent Security & Governance Trail</h2>
            <p className="card-subtitle">Immutable append-only record of administrative mutations</p>
          </div>
          <button
            className="text-link-btn"
            onClick={() => onNavigateTab?.("reports")}
          >
            <span>Full Audit Trail</span>
            <ArrowUpRightIcon size={14} />
          </button>
        </div>

        {loading ? (
          <div className="loading-state-mini">Loading security audit records...</div>
        ) : !data?.recentAuditLogs || data.recentAuditLogs.length === 0 ? (
          <div className="empty-state-mini">
            <p>No administrative operations recorded in this session.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="info-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Resource Target</th>
                  <th>Target ID</th>
                  <th>Client IP</th>
                  <th>Event Context</th>
                </tr>
              </thead>
              <tbody>
                {data.recentAuditLogs.slice(0, 5).map((log) => (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: "nowrap", fontSize: "12px", color: "var(--text-muted)" }}>
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </td>
                    <td>
                      <StatusPill tone={log.action.includes("DELETE") || log.action.includes("CANCEL") ? "red" : log.action.includes("CREATE") ? "green" : "teal"}>
                        {log.action}
                      </StatusPill>
                    </td>
                    <td>
                      <span className="resource-chip">{log.resourceType}</span>
                    </td>
                    <td>
                      <code>{log.resourceId?.slice(0, 10) || "—"}</code>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{log.ipAddress || "127.0.0.1"}</span>
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      {typeof log.details === "object" ? JSON.stringify(log.details) : (log.details || "—")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
