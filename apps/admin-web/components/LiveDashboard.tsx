"use client";

import React, { useEffect, useState } from "react";
import { MetricCard } from "./MetricCard";
import { StatusPill } from "./StatusPill";
import { AdminDashboardData, AuthUser } from "@apartment/shared";
import { adminApi } from "../lib/api";

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
  const totalUnits = data?.stats?.totalUnits ?? data?.systemMetrics?.totalUnits ?? 0;
  const occupancyRate = data?.stats?.occupancyRate ?? data?.systemMetrics?.occupancyRate ?? "0%";
  const pendingMaintenance = data?.stats?.pendingMaintenance ?? 0;
  const pendingDues = data?.stats?.pendingDuesCount ?? 0;
  const activeVisitors = data?.stats?.activeVisitors ?? 0;
  const activeNotices = data?.stats?.activeNotices ?? 0;
  const amenityBookings = data?.stats?.amenityBookingsCount ?? 0;

  return (
    <>
      {/* Active Session Notice Banner */}
      <div className="notice-banner">
        <strong>Super Admin Executive Console:</strong> Welcome back, <strong>{adminUser.fullName}</strong> ({adminUser.email}).
        Server-side role authorization verified. Click any metric card to jump to that module.
      </div>

      {error && (
        <div className="feedback-banner error">
          <span>⚠️ {error}</span>
          <button className="action-btn btn-outline" onClick={fetchDashboard} style={{ marginLeft: "auto" }}>
            Retry
          </button>
        </div>
      )}

      {/* Primary KPI Grid (8 Clickable KPI Cards) */}
      <section className="grid-cards">
        <div
          className="metric-card clickable"
          onClick={() => onNavigateTab?.("residents")}
          title="Jump to Residents"
        >
          <span className="metric-label">Total Residents</span>
          <span className="metric-value tone-blue">
            {loading ? "..." : String(totalResidents)}
          </span>
          <span className="metric-note">Active accounts • Click to view</span>
        </div>

        <div
          className="metric-card clickable"
          onClick={() => onNavigateTab?.("units")}
          title="Jump to Units Inventory"
        >
          <span className="metric-label">Units Inventory</span>
          <span className="metric-value tone-blue">
            {loading ? "..." : String(totalUnits)}
          </span>
          <span className="metric-note">Registered flats • Click to view</span>
        </div>

        <div
          className="metric-card clickable"
          onClick={() => onNavigateTab?.("units")}
          title="Jump to Units & Occupancy"
        >
          <span className="metric-label">Occupancy Rate</span>
          <span className="metric-value tone-green">
            {loading ? "..." : occupancyRate}
          </span>
          <span className="metric-note">Occupied vs vacant homes</span>
        </div>

        <div
          className="metric-card clickable"
          onClick={() => onNavigateTab?.("maintenance")}
          title="Jump to Maintenance Tickets"
        >
          <span className="metric-label">Pending Maintenance</span>
          <span className="metric-value tone-orange">
            {loading ? "..." : String(pendingMaintenance)}
          </span>
          <span className="metric-note">Requires action • Click to review</span>
        </div>

        <div
          className="metric-card clickable"
          onClick={() => onNavigateTab?.("payments")}
          title="Jump to Dues & Payments"
        >
          <span className="metric-label">Pending Dues</span>
          <span className="metric-value tone-red">
            {loading ? "..." : String(pendingDues)}
          </span>
          <span className="metric-note">Unpaid invoices • Click to review</span>
        </div>

        <div
          className="metric-card clickable"
          onClick={() => onNavigateTab?.("visitors")}
          title="Jump to Visitors"
        >
          <span className="metric-label">Active Visitors</span>
          <span className="metric-value tone-blue">
            {loading ? "..." : String(activeVisitors)}
          </span>
          <span className="metric-note">At gate / Pre-approved</span>
        </div>

        <div
          className="metric-card clickable"
          onClick={() => onNavigateTab?.("notices")}
          title="Jump to Notice Board"
        >
          <span className="metric-label">Active Notices</span>
          <span className="metric-value tone-green">
            {loading ? "..." : String(activeNotices)}
          </span>
          <span className="metric-note">Broadcast circulars</span>
        </div>

        <div
          className="metric-card clickable"
          onClick={() => onNavigateTab?.("amenities")}
          title="Jump to Amenities"
        >
          <span className="metric-label">Amenity Bookings</span>
          <span className="metric-value tone-violet">
            {loading ? "..." : String(amenityBookings)}
          </span>
          <span className="metric-note">Confirmed reservations</span>
        </div>
      </section>

      {/* Dual Column: Recent Maintenance & Recent Visitors */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))", gap: "20px" }}>
        {/* Recent Maintenance */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Recent Maintenance Tickets</h2>
              <p className="panel-subtitle">Active requests awaiting operational resolution</p>
            </div>
            <button
              className="action-btn btn-outline"
              onClick={() => onNavigateTab?.("maintenance")}
            >
              View All →
            </button>
          </div>

          {loading ? (
            <div style={{ padding: "16px 0" }}>
              <div className="skeleton-box" style={{ height: "40px", marginBottom: "8px" }} />
              <div className="skeleton-box" style={{ height: "40px" }} />
            </div>
          ) : !data?.openTickets || data.openTickets.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No open maintenance tickets.</p>
          ) : (
            <table className="info-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Unit</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.openTickets.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.title}</strong>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{t.category}</div>
                    </td>
                    <td><code>{t.unitNumber ? `Unit ${t.unitNumber}` : "Tower A"}</code></td>
                    <td>
                      <StatusPill tone={t.priority === "EMERGENCY" ? "red" : t.priority === "HIGH" ? "orange" : "blue"}>
                        {t.priority}
                      </StatusPill>
                    </td>
                    <td>
                      <StatusPill tone={t.status === "IN_PROGRESS" ? "blue" : "orange"}>
                        {t.status}
                      </StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Recent Visitors */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Recent Gate Activity & Passes</h2>
              <p className="panel-subtitle">Visitor register and digital entry verification</p>
            </div>
            <button
              className="action-btn btn-outline"
              onClick={() => onNavigateTab?.("visitors")}
            >
              View All →
            </button>
          </div>

          {loading ? (
            <div style={{ padding: "16px 0" }}>
              <div className="skeleton-box" style={{ height: "40px", marginBottom: "8px" }} />
              <div className="skeleton-box" style={{ height: "40px" }} />
            </div>
          ) : !data?.activeVisitors || data.activeVisitors.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No active visitor passes today.</p>
          ) : (
            <table className="info-table">
              <thead>
                <tr>
                  <th>Visitor</th>
                  <th>Purpose</th>
                  <th>Pass Code</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.activeVisitors.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <strong>{v.visitorName}</strong>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{v.hostName || "Unit 402"}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: "11px", padding: "2px 6px", background: "#f1f5f9", borderRadius: "4px" }}>
                        {v.purpose}
                      </span>
                    </td>
                    <td><code>{v.accessCode}</code></td>
                    <td>
                      <StatusPill tone={v.status === "AT_GATE" ? "orange" : "green"}>
                        {v.status}
                      </StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      {/* Recent Security & Management Audit Activity */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Recent System Audit Trail</h2>
            <p className="panel-subtitle">Latest immutable administrative actions and event dispatches</p>
          </div>
          <button
            className="action-btn btn-outline"
            onClick={() => onNavigateTab?.("reports")}
          >
            Full Audit Logs →
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "16px 0" }}>
            <div className="skeleton-box" style={{ height: "40px", marginBottom: "8px" }} />
            <div className="skeleton-box" style={{ height: "40px" }} />
          </div>
        ) : !data?.recentAuditLogs || data.recentAuditLogs.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No recent audit records found.</p>
        ) : (
          <table className="info-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Resource ID</th>
                <th>IP Address</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {data.recentAuditLogs.slice(0, 6).map((log) => (
                <tr key={log.id}>
                  <td style={{ whiteSpace: "nowrap", fontSize: "12px", color: "var(--text-muted)" }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <strong>{log.action}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", padding: "2px 6px", background: "#f1f5f9", borderRadius: "4px" }}>
                      {log.resourceType}
                    </span>
                  </td>
                  <td><code>{log.resourceId?.slice(0, 10) || "—"}</code></td>
                  <td><span style={{ fontSize: "12px" }}>{log.ipAddress || "127.0.0.1"}</span></td>
                  <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {typeof log.details === "object" ? JSON.stringify(log.details) : (log.details || "—")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
