"use client";

import React, { useEffect, useState } from "react";
import { Visitor } from "@apartment/shared";
import { StatusPill } from "./StatusPill";
import { ConfirmationModal } from "./ConfirmationModal";
import { useToast } from "./Toast";
import { adminApi } from "../lib/api";

export function VisitorsManager() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Status Change State
  const [pendingAction, setPendingAction] = useState<{
    visitorId: string;
    visitorName: string;
    newStatus: string;
  } | null>(null);

  const { success, error: toastError } = useToast();

  const fetchVisitors = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getVisitors();
      setVisitors(data);
    } catch (err) {
      const e = err as Error;
      setError(e.message || "Failed to load visitors list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleConfirmStatus = async () => {
    if (!pendingAction) return;
    const { visitorId, newStatus, visitorName } = pendingAction;
    setUpdatingId(visitorId);

    try {
      await adminApi.updateVisitorStatus(visitorId, newStatus);
      setVisitors((prev) =>
        prev.map((v) => (v.id === visitorId ? { ...v, status: newStatus as any } : v))
      );
      success(`Visitor '${visitorName}' updated to ${newStatus}.`);
    } catch (err) {
      const e = err as Error;
      toastError(e.message || "Failed to update visitor status.");
    } finally {
      setUpdatingId(null);
      setPendingAction(null);
    }
  };

  const filteredVisitors = visitors.filter((v) => {
    const q = search.toLowerCase();
    const matchesSearch =
      v.visitorName.toLowerCase().includes(q) ||
      v.visitorPhone.includes(q) ||
      (v.hostName && v.hostName.toLowerCase().includes(q)) ||
      v.accessCode.toLowerCase().includes(q) ||
      v.purpose.toLowerCase().includes(q);

    if (statusFilter !== "ALL" && v.status !== statusFilter) return false;
    return matchesSearch;
  });

  const getStatusTone = (status: string): "blue" | "green" | "orange" | "red" | "violet" => {
    switch (status) {
      case "CHECKED_IN":
        return "green";
      case "CHECKED_OUT":
        return "blue";
      case "AT_GATE":
        return "orange";
      case "PRE_APPROVED":
        return "violet";
      case "REJECTED":
        return "red";
      default:
        return "blue";
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Gate Operations & Visitor Register</h2>
          <p className="panel-subtitle">Real-time gate pass management, digital entry approvals, and visitor logs</p>
        </div>
        <button className="action-btn btn-outline" onClick={fetchVisitors} disabled={loading}>
          {loading ? "Loading..." : "🔄 Refresh Gate Log"}
        </button>
      </div>

      {error && (
        <div className="feedback-banner error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search by visitor name, phone, pass code, host..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)" }}>
            STATUS:
          </label>
          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses ({visitors.length})</option>
            <option value="PRE_APPROVED">Pre-Approved</option>
            <option value="AT_GATE">At Gate</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="CHECKED_OUT">Checked Out</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Showing <strong>{filteredVisitors.length}</strong> of <strong>{visitors.length}</strong> entries
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "16px 0" }}>
          <div className="skeleton-box" style={{ height: "45px", marginBottom: "8px" }} />
          <div className="skeleton-box" style={{ height: "45px", marginBottom: "8px" }} />
          <div className="skeleton-box" style={{ height: "45px" }} />
        </div>
      ) : filteredVisitors.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No visitors match the current filter.</p>
      ) : (
        <table className="info-table">
          <thead>
            <tr>
              <th>Visitor Details</th>
              <th>Host & Destination</th>
              <th>Visit Purpose</th>
              <th>Digital Pass Code</th>
              <th>Expected Arrival</th>
              <th>Gate Status</th>
              <th>Gate Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVisitors.map((v) => {
              const isUpdating = updatingId === v.id;

              return (
                <tr key={v.id}>
                  <td>
                    <strong>{v.visitorName}</strong>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{v.visitorPhone}</div>
                  </td>
                  <td>
                    <strong>{v.hostName || "Host Resident"}</strong>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {v.unitNumber ? `Unit ${v.unitNumber}` : "Tower A - 402"}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", padding: "2px 8px", background: "#f1f5f9", borderRadius: "4px" }}>
                      {v.purpose}
                    </span>
                  </td>
                  <td>
                    <code style={{ fontSize: "12px", background: "#f8fafc", padding: "3px 8px", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
                      {v.accessCode}
                    </code>
                  </td>
                  <td style={{ whiteSpace: "nowrap", fontSize: "12px", color: "var(--text-muted)" }}>
                    {new Date(v.expectedArrival).toLocaleString()}
                  </td>
                  <td>
                    <StatusPill tone={getStatusTone(v.status)}>{v.status}</StatusPill>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {v.status !== "CHECKED_IN" && (
                        <button
                          className="action-btn btn-success"
                          disabled={isUpdating}
                          onClick={() =>
                            setPendingAction({
                              visitorId: v.id,
                              visitorName: v.visitorName,
                              newStatus: "CHECKED_IN"
                            })
                          }
                        >
                          Check In
                        </button>
                      )}
                      {v.status === "CHECKED_IN" && (
                        <button
                          className="action-btn btn-primary"
                          disabled={isUpdating}
                          onClick={() =>
                            setPendingAction({
                              visitorId: v.id,
                              visitorName: v.visitorName,
                              newStatus: "CHECKED_OUT"
                            })
                          }
                        >
                          Check Out
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationModal
        isOpen={Boolean(pendingAction)}
        title="Confirm Visitor Gate Action"
        message={`Mark entry status of visitor '${pendingAction?.visitorName}' as '${pendingAction?.newStatus}'?`}
        confirmLabel={`Confirm ${pendingAction?.newStatus}`}
        tone="primary"
        isSubmitting={Boolean(updatingId)}
        onConfirm={handleConfirmStatus}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}
