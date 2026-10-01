"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Property } from "@apartment/shared";
import { StatusPill } from "./StatusPill";
import { adminApi } from "../lib/api";
import { useToast } from "./Toast";
import { ConfirmationModal } from "./ConfirmationModal";

export function PropertiesManager() {
  const { success, error: toastError } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState<Partial<Property>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getProperties();
      setProperties(data);
    } catch (err) {
      const e = err as Error;
      setError(e.message || "Failed to load properties");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleOpenEdit = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      name: property.name,
      addressLine1: property.addressLine1,
      addressLine2: property.addressLine2 || "",
      city: property.city,
      state: property.state,
      postalCode: property.postalCode,
      contactEmail: property.contactEmail || "",
      contactPhone: property.contactPhone || "",
      emergencyPhone: property.emergencyPhone || "",
      rulesSummary: property.rulesSummary || "",
      paymentInstructions: property.paymentInstructions || ""
    });
  };

  const handleSaveConfirmed = async () => {
    if (!editingProperty) return;
    setIsSubmitting(true);
    try {
      const updated = await adminApi.updateProperty(editingProperty.id, formData);
      setProperties((prev) =>
        prev.map((p) => (p.id === editingProperty.id ? { ...p, ...updated } : p))
      );
      success(`Property settings for "${formData.name || editingProperty.name}" updated successfully!`);
      setConfirmSaveOpen(false);
      setEditingProperty(null);
    } catch (err) {
      const e = err as Error;
      toastError(e.message || "Failed to update property settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Properties & Community Real Estate</h2>
          <p className="panel-subtitle">Manage registered societies, building blocks, helpline contacts, and society rules</p>
        </div>
        <button className="action-btn btn-outline" onClick={fetchProperties} disabled={loading}>
          {loading ? "Loading..." : "🔄 Refresh"}
        </button>
      </div>

      {error && (
        <div className="feedback-banner error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ padding: "16px 0" }}>
          <div className="skeleton-box" style={{ height: "60px", marginBottom: "12px" }} />
          <div className="skeleton-box" style={{ height: "60px" }} />
        </div>
      ) : properties.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No properties registered yet.</p>
      ) : (
        <div className="module-overview-grid" style={{ marginBottom: "20px" }}>
          {properties.map((p) => (
            <div key={p.id} className="module-card">
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "700" }}>{p.name}</h3>
                  <StatusPill tone="green">Active Estate</StatusPill>
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "10px" }}>
                  📍 {p.addressLine1}{p.addressLine2 ? `, ${p.addressLine2}` : ""}, {p.city}, {p.state} {p.postalCode}
                </p>

                <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "var(--text-main)", background: "#f8fafc", padding: "10px 14px", borderRadius: "6px", marginBottom: "12px" }}>
                  <div><strong>Code:</strong> <code>{p.code}</code></div>
                  <div><strong>Blocks:</strong> {p.totalBlocks}</div>
                  <div><strong>Total Units:</strong> {p.totalUnits}</div>
                </div>

                {/* Society Helplines & Contacts */}
                <div style={{ background: "#f1f5f9", padding: "10px 14px", borderRadius: "6px", fontSize: "12px", marginBottom: "12px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "6px" }}>
                    <div>
                      <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>Management Office:</span><br />
                      <strong>{p.contactPhone || "+91 80 2841 5500"}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>Emergency Helpline:</span><br />
                      <strong style={{ color: "#dc2626" }}>{p.emergencyPhone || "+91 80 9999 1122"}</strong>
                    </div>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>Office Email:</span><br />
                    <span>{p.contactEmail || "office@community.local"}</span>
                  </div>
                </div>

                {/* Society Bylaws / Rules Summary */}
                {p.rulesSummary && (
                  <div style={{ background: "#fafafa", border: "1px solid #e2e8f0", padding: "10px 12px", borderRadius: "6px", fontSize: "11px", marginBottom: "12px" }}>
                    <strong style={{ color: "#334155" }}>📜 Society Guidelines & Rules:</strong>
                    <p style={{ margin: "4px 0 0 0", color: "#64748b", whiteSpace: "pre-line" }}>{p.rulesSummary}</p>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Registered {new Date(p.createdAt).toLocaleDateString()}
                </span>
                <button
                  className="action-btn btn-primary"
                  onClick={() => handleOpenEdit(p)}
                  style={{ fontSize: "12px", padding: "6px 14px" }}
                >
                  ⚙️ Configure Settings
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Property Settings Modal */}
      {editingProperty && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: "620px" }}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>
                  ⚙️ Configure Society / Property Settings
                </h3>
                <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
                  Property Code: <code>{editingProperty.code}</code>
                </p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setEditingProperty(null)}
                disabled={isSubmitting}
              >
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="admin-form-group">
                <label>Society / Community Name *</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="admin-form-group">
                  <label>Address Line 1 *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.addressLine1 || ""}
                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Address Line 2</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.addressLine2 || ""}
                    onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div className="admin-form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.city || ""}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="admin-form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.state || ""}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Postal Code *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.postalCode || ""}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="admin-form-group">
                  <label>Management Office Phone *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="+91 80 2841 5500"
                    value={formData.contactPhone || ""}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Emergency Security Helpline *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="+91 80 9999 1122"
                    value={formData.emergencyPhone || ""}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Management Office Email *</label>
                <input
                  type="email"
                  className="admin-form-input"
                  placeholder="office@greenfield.local"
                  value={formData.contactEmail || ""}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <div className="admin-form-group">
                <label>Maintenance Dues Payment Instructions</label>
                <textarea
                  className="admin-form-textarea"
                  rows={2}
                  placeholder="Bank account details, NEFT/RTGS, UPI ID..."
                  value={formData.paymentInstructions || ""}
                  onChange={(e) => setFormData({ ...formData, paymentInstructions: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <div className="admin-form-group">
                <label>Society Rules & Bylaws Summary</label>
                <textarea
                  className="admin-form-textarea"
                  rows={3}
                  placeholder="Key community bylaws, quiet hours, parking regulations..."
                  value={formData.rulesSummary || ""}
                  onChange={(e) => setFormData({ ...formData, rulesSummary: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="action-btn btn-outline"
                onClick={() => setEditingProperty(null)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="action-btn btn-primary"
                onClick={() => setConfirmSaveOpen(true)}
                disabled={isSubmitting || !formData.name?.trim()}
              >
                💾 Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmSaveOpen}
        title="Confirm Property Configuration Update"
        message={`Are you sure you want to update the official society configuration for "${formData.name}"? These contact helplines and guidelines will be published across all resident applications.`}
        confirmLabel="Yes, Save Settings"
        tone="primary"
        isSubmitting={isSubmitting}
        onConfirm={handleSaveConfirmed}
        onCancel={() => setConfirmSaveOpen(false)}
      />
    </div>
  );
}
