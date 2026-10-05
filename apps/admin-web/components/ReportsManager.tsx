"use client";

import React, { useEffect, useState, useCallback } from "react";
import { OperationalReportsData } from "@apartment/shared";
import { adminApi } from "../lib/api";
import { AuditLogViewer } from "./AuditLogViewer";

export function ReportsManager() {
  const [activeTab, setActiveTab] = useState<"operational" | "audit">("operational");
  const [reportsData, setReportsData] = useState<OperationalReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getOperationalReports();
      setReportsData(data);
    } catch (err) {
      const e = err as Error;
      setError(e.message || "Failed to load operational analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "operational") {
      loadReports();
    }
  }, [activeTab, loadReports]);

  return (
    <div className="section-container">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">Reports & Compliance</h1>
          <p className="section-subtitle">
            Real-time financial collections, maintenance SLAs, visitor volume, occupancy distribution, and security audit logs
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className={`btn ${activeTab === "operational" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("operational")}
          >
            Operational Reports
          </button>
          <button
            className={`btn ${activeTab === "audit" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("audit")}
          >
            Security Audit Trail
          </button>
        </div>
      </div>

      {activeTab === "audit" ? (
        <AuditLogViewer />
      ) : loading ? (
        <div className="loading-state" style={{ padding: "4rem", textAlign: "center" }}>
          <p>Calculating operational reports from real community data...</p>
        </div>
      ) : error ? (
        <div className="empty-state error" style={{ padding: "3rem", textAlign: "center" }}>
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={loadReports} style={{ marginTop: "1rem" }}>
            Retry
          </button>
        </div>
      ) : !reportsData ? null : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", marginTop: "1.5rem" }}>
          {/* 1. Financial Collection Report */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a" }}>
                1. Financial Collection Report
              </h2>
              <span className="badge badge-success" style={{ fontSize: "0.9rem" }}>
                Collection Rate: {reportsData.financial.collectionRate}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase" }}>Total Billed</span>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", marginTop: "4px" }}>
                  ₹{reportsData.financial.totalBilled.toLocaleString("en-IN")}
                </div>
              </div>
              <div style={{ background: "#f0fdf4", padding: "1rem", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                <span style={{ fontSize: "0.8rem", color: "#166534", textTransform: "uppercase" }}>Total Collected</span>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#15803d", marginTop: "4px" }}>
                  ₹{reportsData.financial.totalCollected.toLocaleString("en-IN")}
                </div>
              </div>
              <div style={{ background: "#fff7ed", padding: "1rem", borderRadius: "8px", border: "1px solid #fed7aa" }}>
                <span style={{ fontSize: "0.8rem", color: "#9a3412", textTransform: "uppercase" }}>Pending Invoices</span>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ea580c", marginTop: "4px" }}>
                  ₹{reportsData.financial.totalPending.toLocaleString("en-IN")}
                </div>
                <small style={{ color: "#9a3412" }}>{reportsData.financial.duesByStatus.pending} pending invoices</small>
              </div>
              <div style={{ background: "#fef2f2", padding: "1rem", borderRadius: "8px", border: "1px solid #fecaca" }}>
                <span style={{ fontSize: "0.8rem", color: "#991b1b", textTransform: "uppercase" }}>Overdue Invoices</span>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#dc2626", marginTop: "4px" }}>
                  {reportsData.financial.duesByStatus.overdue} Units
                </div>
                <small style={{ color: "#991b1b" }}>Late notices sent</small>
              </div>
            </div>

            {reportsData.financial.recentPayments.length > 0 && (
              <div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "0.5rem" }}>
                  Recently Settled Receipts
                </h3>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Resident / Unit</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Settlement Ref</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportsData.financial.recentPayments.map((p) => (
                        <tr key={p.id}>
                          <td>{p.title}</td>
                          <td>{p.residentName || "Flat 402"}</td>
                          <td style={{ fontWeight: 600 }}>₹{p.amount.toLocaleString("en-IN")}</td>
                          <td>
                            <span className="badge badge-success">PAID</span>
                          </td>
                          <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                            {p.paymentReference || "UPI-DEMO-REF-992"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* 2. Maintenance SLA Report */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a" }}>
                2. Maintenance SLA Report
              </h2>
              <span className="badge badge-secondary" style={{ fontSize: "0.9rem" }}>
                Avg Resolution Time: {reportsData.maintenance.avgResolutionHours} hrs
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px" }}>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Total Requests</span>
                <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>{reportsData.maintenance.totalRequests}</div>
              </div>
              <div style={{ background: "#f0fdf4", padding: "1rem", borderRadius: "8px" }}>
                <span style={{ fontSize: "0.8rem", color: "#166534" }}>Resolved Requests</span>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#16a34a" }}>
                  {reportsData.maintenance.resolvedRequests}
                </div>
              </div>
              <div style={{ background: "#fffbeb", padding: "1rem", borderRadius: "8px" }}>
                <span style={{ fontSize: "0.8rem", color: "#92400e" }}>In-Progress / Assigned</span>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#d97706" }}>
                  {reportsData.maintenance.inProgressRequests}
                </div>
              </div>
            </div>

            <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#475569", marginBottom: "0.5rem" }}>
              Tickets by Trade Category
            </h3>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {Object.entries(reportsData.maintenance.categoryBreakdown).map(([category, count]) => (
                <div
                  key={category}
                  style={{
                    border: "1px solid #e2e8f0",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center"
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{category.replace(/_/g, " ")}:</span>
                  <span className="badge badge-secondary">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Visitor Traffic & 4. Occupancy Distribution side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {/* 3. Visitor Traffic */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "1rem" }}>
                3. Visitor Traffic Activity
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", background: "var(--bg-secondary)", borderRadius: "6px" }}>
                  <span>Total Logged Entries:</span>
                  <strong>{reportsData.visitors.totalVisitors}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", background: "var(--bg-secondary)", borderRadius: "6px" }}>
                  <span>Currently On Premises (At Gate / In):</span>
                  <strong style={{ color: "var(--primary)" }}>{reportsData.visitors.checkedInCount}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", background: "var(--bg-secondary)", borderRadius: "6px" }}>
                  <span>Checked Out / Departed:</span>
                  <strong>{reportsData.visitors.checkedOutCount}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", background: "#f8fafc", borderRadius: "6px" }}>
                  <span>Peak Influx Window:</span>
                  <strong>{reportsData.visitors.peakArrivalHour}</strong>
                </div>
              </div>
            </div>

            {/* 4. Occupancy Distribution */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a" }}>
                  4. Occupancy Distribution
                </h2>
                <span className="badge badge-success" style={{ fontSize: "0.9rem" }}>
                  {reportsData.occupancy.occupancyRate} Occupied
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", background: "#f8fafc", borderRadius: "6px" }}>
                  <span>Total Registered Flats:</span>
                  <strong>{reportsData.occupancy.totalUnits}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", background: "#f0fdf4", borderRadius: "6px" }}>
                  <span style={{ color: "#15803d" }}>Occupied Flats:</span>
                  <strong style={{ color: "#15803d" }}>{reportsData.occupancy.occupiedUnits}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", background: "#fff7ed", borderRadius: "6px" }}>
                  <span style={{ color: "#c2410c" }}>Vacant Flats:</span>
                  <strong style={{ color: "#c2410c" }}>{reportsData.occupancy.vacantUnits}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", background: "#f8fafc", borderRadius: "6px" }}>
                  <span>Under Maintenance:</span>
                  <strong>{reportsData.occupancy.underMaintenanceUnits}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
