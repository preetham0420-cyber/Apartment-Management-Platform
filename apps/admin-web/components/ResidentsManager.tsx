"use client";

import React, { useEffect, useState } from "react";
import { UserSummary, PendingOnboarding } from "@apartment/shared";
import { StatusPill } from "./StatusPill";
import { ConfirmationModal } from "./ConfirmationModal";
import { useToast } from "./Toast";
import { adminApi } from "../lib/api";

export function ResidentsManager() {
  const [residents, setResidents] = useState<UserSummary[]>([]);
  const [pendingOnboardings, setPendingOnboardings] = useState<PendingOnboarding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Selected Resident for Detailed Inspection Modal
  const [selectedResident, setSelectedResident] = useState<UserSummary | null>(null);

  // Pending Onboardings Modal State
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [actionAssignment, setActionAssignment] = useState<PendingOnboarding | null>(null);
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | null>(null);
  const [rejectReason, setRejectReason] = useState("Tenant lease agreement verification failed");
  const [isProcessingOnboarding, setIsProcessingOnboarding] = useState(false);

  // Status Change Confirmation Dialog State
  const [pendingChange, setPendingChange] = useState<{
    residentId: string;
    fullName: string;
    nextStatus: "ACTIVE" | "INACTIVE";
  } | null>(null);

  const { success, error: toastError } = useToast();

  const fetchResidents = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resData, onbData] = await Promise.all([
        adminApi.getResidents(),
        adminApi.getPendingOnboardings()
      ]);
      setResidents(resData);
      setPendingOnboardings(onbData);
    } catch (err) {
      const e = err as Error;
      setError(e.message || "Failed to load residents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  const handleApproveOnboarding = async (assignment: PendingOnboarding) => {
    setIsProcessingOnboarding(true);
    try {
      await adminApi.approveOnboarding(assignment.assignmentId);
      setPendingOnboardings((prev) => prev.filter((p) => p.assignmentId !== assignment.assignmentId));
      success(`Resident onboarding for '${assignment.fullName}' approved! Account is now active.`);
      setActionAssignment(null);
      setActionType(null);
      fetchResidents();
    } catch (err) {
      const e = err as Error;
      toastError(e.message || "Failed to approve resident application.");
    } finally {
      setIsProcessingOnboarding(false);
    }
  };

  const handleRejectOnboarding = async (assignment: PendingOnboarding) => {
    setIsProcessingOnboarding(true);
    try {
      await adminApi.rejectOnboarding(assignment.assignmentId, rejectReason);
      setPendingOnboardings((prev) => prev.filter((p) => p.assignmentId !== assignment.assignmentId));
      success(`Application for '${assignment.fullName}' rejected.`);
      setActionAssignment(null);
      setActionType(null);
    } catch (err) {
      const e = err as Error;
      toastError(e.message || "Failed to reject resident application.");
    } finally {
      setIsProcessingOnboarding(false);
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingChange) return;
    const { residentId, nextStatus, fullName } = pendingChange;
    setUpdatingId(residentId);

    try {
      await adminApi.updateResidentStatus(residentId, nextStatus);
      setResidents((prev) =>
        prev.map((r) => (r.id === residentId ? { ...r, status: nextStatus } : r))
      );
      success(`Resident '${fullName}' is now ${nextStatus}.`);
    } catch (err) {
      const e = err as Error;
      toastError(e.message || "Failed to update resident status.");
    } finally {
      setUpdatingId(null);
      setPendingChange(null);
    }
  };

  const filteredResidents = residents.filter((r) => {
    const query = search.toLowerCase();
    const matchesSearch =
      r.fullName.toLowerCase().includes(query) ||
      r.email.toLowerCase().includes(query) ||
      (r.phoneNumber && r.phoneNumber.includes(query)) ||
      (r.unitId && r.unitId.toLowerCase().includes(query));

    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (roleFilter !== "ALL" && r.role !== roleFilter) return false;

    return matchesSearch;
  });

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Residents & Units Management Directory</h2>
          <p className="panel-subtitle">Manage resident verification, account status, and role authority</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="action-btn btn-primary"
            onClick={() => setIsOnboardingModalOpen(true)}
            style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
          >
            Pending Registrations
            {pendingOnboardings.length > 0 && (
              <span
                style={{
                  marginLeft: "8px",
                  background: "#ef4444",
                  color: "#fff",
                  borderRadius: "10px",
                  padding: "1px 7px",
                  fontSize: "11px",
                  fontWeight: 700
                }}
              >
                {pendingOnboardings.length}
              </span>
            )}
          </button>
          <button className="action-btn btn-outline" onClick={fetchResidents} disabled={loading}>
            {loading ? "Loading..." : "🔄 Refresh Directory"}
          </button>
        </div>
      </div>

      {error && (
        <div className="feedback-banner error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Multi-criteria Filter Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search residents by name, email, or unit..."
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
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)" }}>
            ROLE:
          </label>
          <select
            className="admin-filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="RESIDENT_TENANT">Resident Tenant</option>
            <option value="RESIDENT_OWNER">Resident Owner</option>
            <option value="COMMITTEE_MEMBER">Committee</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>

        <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Showing <strong>{filteredResidents.length}</strong> of <strong>{residents.length}</strong> members
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "16px 0" }}>
          <div className="skeleton-box" style={{ height: "45px", marginBottom: "8px" }} />
          <div className="skeleton-box" style={{ height: "45px", marginBottom: "8px" }} />
          <div className="skeleton-box" style={{ height: "45px" }} />
        </div>
      ) : filteredResidents.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No residents match the current search filter.</p>
      ) : (
        <table className="info-table">
          <thead>
            <tr>
              <th>Resident Name</th>
              <th>Email Address</th>
              <th>Contact Phone</th>
              <th>Community Role</th>
              <th>Account Status</th>
              <th>Assigned Unit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredResidents.map((r) => {
              const isUpdating = updatingId === r.id;
              const isActive = r.status === "ACTIVE";

              return (
                <tr key={r.id}>
                  <td>
                    <div
                      style={{ cursor: "pointer", color: "var(--primary)", fontWeight: 700 }}
                      onClick={() => setSelectedResident(r)}
                      title="Click to view full resident details"
                    >
                      {r.fullName} ↗
                    </div>
                  </td>
                  <td>{r.email}</td>
                  <td>{r.phoneNumber || "—"}</td>
                  <td>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "4px",
                        background: r.role === "RESIDENT_TENANT" ? "rgba(91, 108, 249, 0.1)" : "rgba(139, 92, 246, 0.1)",
                        color: r.role === "RESIDENT_TENANT" ? "#5b6cf9" : "#8b5cf6"
                      }}
                    >
                      {r.role}
                    </span>
                  </td>
                  <td>
                    <StatusPill tone={isActive ? "green" : "red"}>
                      {r.status}
                    </StatusPill>
                  </td>
                  <td>
                    <code style={{ fontSize: "12px", background: "#f8fafc", padding: "2px 6px", borderRadius: "4px" }}>
                      {r.unitId ? r.unitId.slice(0, 8) : "None"}
                    </code>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        className="action-btn btn-outline"
                        onClick={() => setSelectedResident(r)}
                      >
                        Details
                      </button>
                      <button
                        className={`action-btn ${isActive ? "btn-danger" : "btn-success"}`}
                        disabled={isUpdating}
                        onClick={() =>
                          setPendingChange({
                            residentId: r.id,
                            fullName: r.fullName,
                            nextStatus: isActive ? "INACTIVE" : "ACTIVE"
                          })
                        }
                      >
                        {isUpdating ? "..." : isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Resident Details Modal */}
      {selectedResident && (
        <div className="modal-backdrop" onClick={() => setSelectedResident(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Resident Account Profile</h3>
              <button className="modal-close-btn" onClick={() => setSelectedResident(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>FULL NAME</label>
                  <p style={{ fontSize: "15px", fontWeight: 700 }}>{selectedResident.fullName}</p>
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>EMAIL ADDRESS</label>
                  <p style={{ fontSize: "14px" }}>{selectedResident.email}</p>
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>PHONE NUMBER</label>
                  <p style={{ fontSize: "14px" }}>{selectedResident.phoneNumber || "Not registered"}</p>
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>SYSTEM ROLE</label>
                  <p><StatusPill tone="blue">{selectedResident.role}</StatusPill></p>
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>ACCOUNT STATUS</label>
                  <p><StatusPill tone={selectedResident.status === "ACTIVE" ? "green" : "red"}>{selectedResident.status}</StatusPill></p>
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>ASSIGNED UNIT IDENTIFIER</label>
                  <p><code>{selectedResident.unitId || "No unit assigned"}</code></p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="action-btn btn-primary" onClick={() => setSelectedResident(null)}>
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Onboarding Applications Modal */}
      {isOnboardingModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsOnboardingModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: "760px", width: "95%" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Pending Resident Onboarding Applications</h3>
              <button className="modal-close-btn" onClick={() => setIsOnboardingModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              {pendingOnboardings.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                  <p>No pending resident registrations awaiting review.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Resident</th>
                      <th>Assigned Unit</th>
                      <th>Requested Role</th>
                      <th>Requested Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOnboardings.map((p) => (
                      <tr key={p.assignmentId}>
                        <td>
                          <strong>{p.fullName}</strong>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>{p.email}</div>
                          {p.phoneNumber && <div style={{ fontSize: "11px", color: "#94a3b8" }}>{p.phoneNumber}</div>}
                        </td>
                        <td>
                          <strong>{p.block} - Flat {p.unitNumber}</strong>
                        </td>
                        <td>
                          <StatusPill tone="blue">{p.role}</StatusPill>
                        </td>
                        <td>{new Date(p.requestedAt).toLocaleDateString()}</td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              className="action-btn btn-success"
                              disabled={isProcessingOnboarding}
                              onClick={() => {
                                setActionAssignment(p);
                                setActionType("APPROVE");
                              }}
                            >
                              Approve
                            </button>
                            <button
                              className="action-btn btn-danger"
                              disabled={isProcessingOnboarding}
                              onClick={() => {
                                setActionAssignment(p);
                                setActionType("REJECT");
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="modal-footer">
              <button className="action-btn btn-outline" onClick={() => setIsOnboardingModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {actionAssignment && actionType === "APPROVE" && (
        <ConfirmationModal
          isOpen={true}
          title="Approve Resident Onboarding"
          message={`Approve '${actionAssignment.fullName}' for Flat ${actionAssignment.unitNumber} (${actionAssignment.block}) as ${actionAssignment.role}? Their account will be activated immediately with mobile portal access.`}
          confirmLabel={isProcessingOnboarding ? "Activating..." : "Confirm & Activate"}
          tone="success"
          isSubmitting={isProcessingOnboarding}
          onConfirm={() => handleApproveOnboarding(actionAssignment)}
          onCancel={() => {
            setActionAssignment(null);
            setActionType(null);
          }}
        />
      )}

      {/* Reject Reason Confirmation Modal */}
      {actionAssignment && actionType === "REJECT" && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: "480px" }}>
            <div className="modal-header">
              <h3>Reject Resident Onboarding Application</h3>
              <button className="modal-close-btn" onClick={() => { setActionAssignment(null); setActionType(null); }}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "14px", marginBottom: "1rem", color: "#475569" }}>
                Please provide the justification for rejecting the registration application of <strong>{actionAssignment.fullName}</strong>.
              </p>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>Rejection Reason *</label>
              <textarea
                className="form-textarea"
                rows={3}
                style={{ width: "100%", marginTop: "6px", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Tenancy agreement verification could not be validated..."
              />
            </div>
            <div className="modal-footer">
              <button
                className="action-btn btn-outline"
                disabled={isProcessingOnboarding}
                onClick={() => { setActionAssignment(null); setActionType(null); }}
              >
                Cancel
              </button>
              <button
                className="action-btn btn-danger"
                disabled={isProcessingOnboarding || !rejectReason.trim()}
                onClick={() => handleRejectOnboarding(actionAssignment)}
              >
                {isProcessingOnboarding ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(pendingChange)}
        title="Confirm Resident Status Modification"
        message={`Are you sure you want to mark '${pendingChange?.fullName}' as ${pendingChange?.nextStatus}? Inactive residents cannot log into the mobile portal.`}
        confirmLabel={pendingChange?.nextStatus === "ACTIVE" ? "Activate Account" : "Deactivate Account"}
        tone={pendingChange?.nextStatus === "ACTIVE" ? "success" : "danger"}
        isSubmitting={Boolean(updatingId)}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setPendingChange(null)}
      />
    </div>
  );
}
