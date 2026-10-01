"use client";

import React, { useEffect, useState } from "react";
import { MaintenanceRequest, MaintenanceStatus, MaintenancePriority } from "@apartment/shared";
import { StatusPill } from "./StatusPill";
import { ConfirmationModal } from "./ConfirmationModal";
import { useToast } from "./Toast";
import { adminApi } from "../lib/api";

export function MaintenanceManager() {
  const [tickets, setTickets] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Selected Ticket for Detail Modal & Comments
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceRequest | null>(null);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  // Confirmation Dialog
  const [pendingAction, setPendingAction] = useState<{
    ticketId: string;
    ticketTitle: string;
    newStatus: MaintenanceStatus;
  } | null>(null);

  const { success, error: toastError } = useToast();

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getMaintenance();
      setTickets(data);
    } catch (err) {
      const e = err as Error;
      setError(e.message || "Failed to load maintenance requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleConfirmStatus = async () => {
    if (!pendingAction) return;
    const { ticketId, newStatus, ticketTitle } = pendingAction;
    setUpdatingId(ticketId);

    try {
      await adminApi.updateMaintenanceStatus(ticketId, newStatus);
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
      );
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      success(`Ticket '${ticketTitle}' marked as ${newStatus}.`);
    } catch (err) {
      const e = err as Error;
      toastError(e.message || "Failed to update ticket status.");
    } finally {
      setUpdatingId(null);
      setPendingAction(null);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newComment.trim()) return;

    setPostingComment(true);
    try {
      await adminApi.addMaintenanceComment(selectedTicket.id, newComment.trim());
      const commentObj = {
        id: `comm-${Date.now()}`,
        requestId: selectedTicket.id,
        authorId: "admin",
        authorName: "Platform Super Admin",
        authorRole: "SUPER_ADMIN",
        comment: newComment.trim(),
        createdAt: new Date().toISOString()
      };

      const updatedComments = [...(selectedTicket.comments || []), commentObj];
      setSelectedTicket({ ...selectedTicket, comments: updatedComments });
      setTickets((prev) =>
        prev.map((t) => (t.id === selectedTicket.id ? { ...t, comments: updatedComments } : t))
      );
      setNewComment("");
      success("Comment added to ticket.");
    } catch (err) {
      const e = err as Error;
      toastError(e.message || "Failed to post comment.");
    } finally {
      setPostingComment(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const q = search.toLowerCase();
    const matchesSearch =
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      (t.residentName && t.residentName.toLowerCase().includes(q)) ||
      (t.unitNumber && t.unitNumber.includes(q)) ||
      t.category.toLowerCase().includes(q);

    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
    return matchesSearch;
  });

  const getPriorityTone = (priority: string): "blue" | "green" | "orange" | "red" | "violet" => {
    switch (priority) {
      case "EMERGENCY":
        return "red";
      case "HIGH":
        return "orange";
      case "MEDIUM":
        return "blue";
      default:
        return "green";
    }
  };

  const getStatusTone = (status: string): "blue" | "green" | "orange" | "red" | "violet" => {
    switch (status) {
      case "RESOLVED":
      case "CLOSED":
        return "green";
      case "IN_PROGRESS":
        return "blue";
      case "REPORTED":
      case "ASSIGNED":
        return "orange";
      case "CANCELLED":
        return "red";
      default:
        return "violet";
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Facility & Maintenance Ticket Desk</h2>
          <p className="panel-subtitle">Review, assign, inspect, and update community maintenance requests</p>
        </div>
        <button className="action-btn btn-outline" onClick={fetchTickets} disabled={loading}>
          {loading ? "Loading..." : "🔄 Refresh Tickets"}
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
            placeholder="Search tickets by title, resident, unit..."
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
            <option value="ALL">All Statuses ({tickets.length})</option>
            <option value="REPORTED">Reported</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)" }}>
            PRIORITY:
          </label>
          <select
            className="admin-filter-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="ALL">All Priorities</option>
            <option value="EMERGENCY">Emergency</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Showing <strong>{filteredTickets.length}</strong> active requests
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "16px 0" }}>
          <div className="skeleton-box" style={{ height: "45px", marginBottom: "8px" }} />
          <div className="skeleton-box" style={{ height: "45px", marginBottom: "8px" }} />
          <div className="skeleton-box" style={{ height: "45px" }} />
        </div>
      ) : filteredTickets.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No tickets match the selected filters.</p>
      ) : (
        <table className="info-table">
          <thead>
            <tr>
              <th>Ticket Summary</th>
              <th>Resident & Unit</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Current Status</th>
              <th>Created</th>
              <th>Operations</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((t) => {
              const isUpdating = updatingId === t.id;

              return (
                <tr key={t.id}>
                  <td>
                    <div
                      style={{ cursor: "pointer", color: "var(--primary)", fontWeight: 700 }}
                      onClick={() => setSelectedTicket(t)}
                      title="Click to view full ticket details and comments"
                    >
                      {t.title} ↗
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                      {t.description.length > 50 ? `${t.description.slice(0, 50)}...` : t.description}
                    </p>
                  </td>
                  <td>
                    <strong>{t.residentName || "Resident"}</strong>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {t.unitNumber ? `Unit ${t.unitNumber}` : "Tower A"}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", padding: "2px 8px", background: "#f1f5f9", borderRadius: "4px" }}>
                      {t.category}
                    </span>
                  </td>
                  <td>
                    <StatusPill tone={getPriorityTone(t.priority)}>{t.priority}</StatusPill>
                  </td>
                  <td>
                    <StatusPill tone={getStatusTone(t.status)}>{t.status}</StatusPill>
                  </td>
                  <td style={{ whiteSpace: "nowrap", fontSize: "12px", color: "var(--text-muted)" }}>
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        className="action-btn btn-outline"
                        onClick={() => setSelectedTicket(t)}
                      >
                        Inspect
                      </button>
                      {(t.status === "REPORTED" || t.status === "ASSIGNED") && (
                        <button
                          className="action-btn btn-primary"
                          disabled={isUpdating}
                          onClick={() =>
                            setPendingAction({
                              ticketId: t.id,
                              ticketTitle: t.title,
                              newStatus: "IN_PROGRESS"
                            })
                          }
                        >
                          Start
                        </button>
                      )}
                      {(t.status === "REPORTED" || t.status === "ASSIGNED" || t.status === "IN_PROGRESS") && (
                        <button
                          className="action-btn btn-success"
                          disabled={isUpdating}
                          onClick={() =>
                            setPendingAction({
                              ticketId: t.id,
                              ticketTitle: t.title,
                              newStatus: "RESOLVED"
                            })
                          }
                        >
                          Resolve
                        </button>
                      )}
                      {t.status !== "CANCELLED" && t.status !== "RESOLVED" && t.status !== "CLOSED" && (
                        <button
                          className="action-btn btn-danger"
                          disabled={isUpdating}
                          onClick={() =>
                            setPendingAction({
                              ticketId: t.id,
                              ticketTitle: t.title,
                              newStatus: "CANCELLED"
                            })
                          }
                        >
                          Cancel
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

      {/* Ticket Details & Comments Modal */}
      {selectedTicket && (
        <div className="modal-backdrop" onClick={() => setSelectedTicket(null)}>
          <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{selectedTicket.title}</h3>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Ticket ID: <code>{selectedTicket.id}</code>
                </span>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedTicket(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>CATEGORY & PRIORITY</label>
                  <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                    <span style={{ padding: "2px 8px", background: "#f1f5f9", borderRadius: "4px", fontSize: "12px" }}>
                      {selectedTicket.category}
                    </span>
                    <StatusPill tone={getPriorityTone(selectedTicket.priority)}>{selectedTicket.priority}</StatusPill>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>CURRENT STATUS</label>
                  <div style={{ marginTop: "4px" }}>
                    <StatusPill tone={getStatusTone(selectedTicket.status)}>{selectedTicket.status}</StatusPill>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>RESIDENT / CONTACT</label>
                  <p style={{ fontSize: "13px", fontWeight: 600, marginTop: "2px" }}>
                    {selectedTicket.residentName || "Resident Tenant"}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>UNIT DETAILS</label>
                  <p style={{ fontSize: "13px", marginTop: "2px" }}>
                    <code>{selectedTicket.unitNumber ? `Unit ${selectedTicket.unitNumber}` : "Tower A - 402"}</code>
                  </p>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>DESCRIPTION</label>
                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "6px", fontSize: "13px", color: "var(--text-main)", marginTop: "4px" }}>
                  {selectedTicket.description}
                </div>
              </div>

              {/* Comments Feed */}
              <div style={{ marginTop: "20px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-main)" }}>
                  Audit & Discussion Thread ({selectedTicket.comments?.length || 0})
                </label>
                <div className="comments-feed">
                  {!selectedTicket.comments || selectedTicket.comments.length === 0 ? (
                    <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>No comments yet on this ticket.</p>
                  ) : (
                    selectedTicket.comments.map((c) => (
                      <div key={c.id} className="comment-card">
                        <div className="comment-card-header">
                          <span>{c.authorName} ({c.authorRole})</span>
                          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                            {new Date(c.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p style={{ color: "var(--text-main)" }}>{c.comment}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="Write an operational note or status comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={postingComment}
                  />
                  <button
                    type="submit"
                    className="action-btn btn-primary"
                    disabled={postingComment || !newComment.trim()}
                  >
                    {postingComment ? "Posting..." : "Reply"}
                  </button>
                </form>
              </div>
            </div>
            <div className="modal-footer">
              <button className="action-btn btn-outline" onClick={() => setSelectedTicket(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationModal
        isOpen={Boolean(pendingAction)}
        title="Confirm Maintenance Workflow Action"
        message={`Are you sure you want to transition ticket '${pendingAction?.ticketTitle}' to status '${pendingAction?.newStatus}'?`}
        confirmLabel={`Set to ${pendingAction?.newStatus}`}
        tone={pendingAction?.newStatus === "CANCELLED" ? "danger" : "success"}
        isSubmitting={Boolean(updatingId)}
        onConfirm={handleConfirmStatus}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}
