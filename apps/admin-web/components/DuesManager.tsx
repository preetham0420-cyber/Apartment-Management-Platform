"use client";

import React, { useEffect, useState } from "react";
import { Due } from "@apartment/shared";
import { StatusPill } from "./StatusPill";
import { MetricCard } from "./MetricCard";
import { ConfirmationModal } from "./ConfirmationModal";
import { useToast } from "./Toast";
import { adminApi } from "../lib/api";

export function DuesManager() {
  const [dues, setDues] = useState<Due[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Record Payment Modal State
  const [paymentModalDue, setPaymentModalDue] = useState<Due | null>(null);
  const [paymentRef, setPaymentRef] = useState("");
  const [recordingPayment, setRecordingPayment] = useState(false);

  const { success, error: toastError } = useToast();

  const fetchDues = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getDues();
      setDues(data);
    } catch (err) {
      const e = err as Error;
      setError(e.message || "Failed to load dues ledger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDues();
  }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalDue) return;

    setRecordingPayment(true);
    try {
      const updated = await adminApi.recordPayment(paymentModalDue.id, {
        amount: paymentModalDue.amount,
        paymentReference: paymentRef.trim() || `OFFLINE-REC-${Date.now()}`
      });

      setDues((prev) =>
        prev.map((d) => (d.id === paymentModalDue.id ? { ...d, status: "PAID", paidAt: new Date().toISOString() } : d))
      );
      success(`Payment of ₹${paymentModalDue.amount.toLocaleString()} recorded for Unit ${paymentModalDue.unitNumber || "402"}.`);
      setPaymentModalDue(null);
      setPaymentRef("");
    } catch (err) {
      const e = err as Error;
      toastError(e.message || "Failed to record payment.");
    } finally {
      setRecordingPayment(false);
    }
  };

  const totalBilled = dues.reduce((acc, d) => acc + (d.amount || 0), 0);
  const paidDues = dues.filter((d) => d.status === "PAID");
  const totalCollected = paidDues.reduce((acc, d) => acc + (d.amount || 0), 0);
  const pendingDues = dues.filter((d) => d.status === "PENDING" || d.status === "OVERDUE");
  const totalPending = pendingDues.reduce((acc, d) => acc + (d.amount || 0), 0);
  const efficiency = totalBilled > 0 ? `${Math.round((totalCollected / totalBilled) * 100)}%` : "0%";

  const filteredDues = dues.filter((d) => {
    const q = search.toLowerCase();
    const matchesSearch =
      d.title.toLowerCase().includes(q) ||
      (d.unitNumber && d.unitNumber.includes(q)) ||
      d.id.toLowerCase().includes(q);

    if (statusFilter !== "ALL" && d.status !== statusFilter) return false;
    return matchesSearch;
  });

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Accounts & Maintenance Dues Ledger</h2>
          <p className="panel-subtitle">Track billing cycles, offline payment recordings, and collection efficiency</p>
        </div>
        <button className="action-btn btn-outline" onClick={fetchDues} disabled={loading}>
          {loading ? "Loading..." : "🔄 Refresh Ledger"}
        </button>
      </div>

      {error && (
        <div className="feedback-banner error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Collection Metrics */}
      <section className="grid-cards" style={{ marginBottom: "20px" }}>
        <MetricCard label="Total Billed" value={`₹${totalBilled.toLocaleString()}`} note="Cumulative society charges" tone="blue" />
        <MetricCard label="Total Collected" value={`₹${totalCollected.toLocaleString()}`} note="Reconciled payments" tone="green" />
        <MetricCard label="Outstanding Dues" value={`₹${totalPending.toLocaleString()}`} note={`${pendingDues.length} pending invoices`} tone="red" />
        <MetricCard label="Collection Rate" value={efficiency} note="Efficiency percentage" tone="violet" />
      </section>

      {/* Filter and Search Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search by invoice title, unit number, ID..."
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
            <option value="ALL">All Invoices ({dues.length})</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>

        <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Showing <strong>{filteredDues.length}</strong> of <strong>{dues.length}</strong> invoices
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "16px 0" }}>
          <div className="skeleton-box" style={{ height: "45px", marginBottom: "8px" }} />
          <div className="skeleton-box" style={{ height: "45px", marginBottom: "8px" }} />
          <div className="skeleton-box" style={{ height: "45px" }} />
        </div>
      ) : filteredDues.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No dues records found matching filter.</p>
      ) : (
        <table className="info-table">
          <thead>
            <tr>
              <th>Invoice Description</th>
              <th>Unit / Home</th>
              <th>Billed Amount</th>
              <th>Due Date</th>
              <th>Payment Status</th>
              <th>Payment Reference</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDues.map((d) => (
              <tr key={d.id}>
                <td>
                  <strong>{d.title}</strong>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>ID: <code>{d.id.slice(0, 14)}...</code></div>
                </td>
                <td>
                  <code>{d.unitNumber ? `Unit ${d.unitNumber}` : "Tower A - 402"}</code>
                </td>
                <td>
                  <strong style={{ fontSize: "14px" }}>₹{Number(d.amount).toLocaleString()}</strong>
                </td>
                <td style={{ whiteSpace: "nowrap", fontSize: "12px" }}>
                  {new Date(d.dueDate).toLocaleDateString()}
                </td>
                <td>
                  <StatusPill tone={d.status === "PAID" ? "green" : d.status === "OVERDUE" ? "red" : "orange"}>
                    {d.status}
                  </StatusPill>
                </td>
                <td>
                  {d.paymentReference ? (
                    <code style={{ fontSize: "11px" }}>{d.paymentReference}</code>
                  ) : (
                    <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>Unpaid</span>
                  )}
                </td>
                <td>
                  {d.status !== "PAID" ? (
                    <button
                      className="action-btn btn-success"
                      onClick={() => setPaymentModalDue(d)}
                    >
                      Record Payment
                    </button>
                  ) : (
                    <span style={{ fontSize: "12px", color: "var(--success)", fontWeight: 600 }}>
                      ✓ Reconciled
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Record Offline Payment Modal */}
      {paymentModalDue && (
        <div className="modal-backdrop" onClick={() => setPaymentModalDue(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Record Offline Payment</h3>
              <button className="modal-close-btn" onClick={() => setPaymentModalDue(null)} disabled={recordingPayment}>
                ✕
              </button>
            </div>
            <form onSubmit={handleRecordPayment}>
              <div className="modal-body">
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div className="notice-banner">
                    Recording payment for <strong>{paymentModalDue.title}</strong> (Unit {paymentModalDue.unitNumber || "402"}).
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)" }}>PAYABLE AMOUNT</label>
                    <p style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-main)" }}>
                      ₹{Number(paymentModalDue.amount).toLocaleString()}
                    </p>
                  </div>
                  <div className="admin-form-group">
                    <label>Payment / Cheque / Bank Reference Number</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="e.g. NEFT-998822 or CHEQUE-445522"
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="action-btn btn-outline"
                  onClick={() => setPaymentModalDue(null)}
                  disabled={recordingPayment}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="action-btn btn-success"
                  disabled={recordingPayment || !paymentRef.trim()}
                >
                  {recordingPayment ? "Recording..." : "Confirm & Record Receipt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
