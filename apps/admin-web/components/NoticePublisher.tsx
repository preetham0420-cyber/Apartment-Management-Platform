"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Notice } from "@apartment/shared";
import { StatusPill } from "./StatusPill";
import { adminApi } from "../lib/api";
import { useToast } from "./Toast";
import { RefreshIcon, AlertTriangleIcon, SearchIcon, BellIcon } from "./icons";

export function NoticePublisher() {
  const { success, error: toastError } = useToast();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<"LOW" | "NORMAL" | "URGENT">("NORMAL");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  const loadNotices = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await adminApi.getNotices();
      setNotices(data);
    } catch (err) {
      const e = err as Error;
      setFetchError(e.message || "Failed to load community notices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setFormError("Notice headline and broadcast message body are required.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const created = await adminApi.createNotice({
        title: title.trim(),
        content: content.trim(),
        priority
      });

      setNotices((prev) => [created, ...prev]);
      success(`Notice "${created.title}" broadcasted to all residents!`);
      setTitle("");
      setContent("");
      setPriority("NORMAL");
    } catch (err) {
      const e = err as Error;
      const msg = e.message || "Failed to publish notice";
      setFormError(msg);
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityTone = (p: string): "teal" | "green" | "orange" | "red" => {
    switch (p) {
      case "URGENT":
        return "red";
      case "NORMAL":
        return "teal";
      case "LOW":
        return "green";
      default:
        return "teal";
    }
  };

  const filteredNotices = notices.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = priorityFilter === "ALL" || n.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Community Broadcast & Notice Dispatcher</h2>
          <p className="panel-subtitle">Publish official circulars, emergency updates, and community alerts across all tenant apps</p>
        </div>
        <button
          className="action-btn btn-outline"
          onClick={loadNotices}
          disabled={loading}
          style={{ fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <RefreshIcon size={14} />
          <span>{loading ? "Refreshing..." : "Refresh Circulars"}</span>
        </button>
      </div>

      {fetchError && (
        <div className="feedback-banner error">
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <AlertTriangleIcon size={14} color="#D95757" />
            <span>{fetchError}</span>
          </span>
          <button
            onClick={loadNotices}
            style={{
              marginLeft: "12px",
              padding: "2px 8px",
              borderRadius: "4px",
              border: "1px solid currentColor",
              background: "transparent",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Notice Creation Form */}
      <form onSubmit={handlePublish} className="admin-form-card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
            Compose New Broadcast Circular
          </h3>
          <StatusPill tone="orange">Direct Broadcast to Mobile</StatusPill>
        </div>

        {formError && (
          <div className="feedback-banner error" style={{ marginBottom: "14px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <AlertTriangleIcon size={14} color="#D95757" />
              <span>{formError}</span>
            </span>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "14px" }}>
          <div className="admin-form-group">
            <label>Notice Headline / Subject *</label>
            <input
              type="text"
              className="admin-form-input"
              placeholder="e.g. Scheduled Water Tank Cleaning & Maintenance"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              maxLength={150}
            />
          </div>

          <div className="admin-form-group">
            <label>Priority Level *</label>
            <select
              className="admin-form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value as "LOW" | "NORMAL" | "URGENT")}
              disabled={isSubmitting}
            >
              <option value="LOW">Low (General Information)</option>
              <option value="NORMAL">Normal (Routine Update)</option>
              <option value="URGENT">Urgent (Immediate Alert)</option>
            </select>
          </div>
        </div>

        <div className="admin-form-group">
          <label>Broadcast Message Body *</label>
          <textarea
            className="admin-form-textarea"
            placeholder="Write the full announcement text here with dates, times, affected wings, or instructions..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
            rows={4}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Dispatches immediately to all registered tenants and super admin audit trail.
          </span>
          <button
            type="submit"
            className="action-btn btn-primary"
            style={{ padding: "8px 20px", fontSize: "13px", fontWeight: 600 }}
            disabled={isSubmitting || !title.trim() || !content.trim()}
          >
            {isSubmitting ? "Broadcasting..." : "🚀 Publish & Dispatch Notice"}
          </button>
        </div>
      </form>

      {/* Broadcast History Register */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
            Published Community Notices
          </h3>
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Showing <strong>{filteredNotices.length}</strong> of <strong>{notices.length}</strong> circulars
          </span>
        </div>

        <div className="admin-filter-bar">
          <div className="admin-search-box">
            <SearchIcon size={15} color="#68716D" />
            <input
              type="text"
              placeholder="Search circulars by headline or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="admin-filter-group">
            <label>Priority:</label>
            <select
              className="admin-filter-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
            Loading published circulars...
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="empty-state-box">
            <span style={{ fontSize: "32px" }}>📢</span>
            <p style={{ margin: "8px 0 0 0", fontWeight: 600 }}>No notices matching criteria.</p>
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
              Publish your first notice using the composer above.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="info-table">
              <thead>
                <tr>
                  <th style={{ width: "22%" }}>Subject / Headline</th>
                  <th style={{ width: "45%" }}>Message Body</th>
                  <th style={{ width: "13%" }}>Priority</th>
                  <th style={{ width: "20%" }}>Dispatch Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotices.map((n) => (
                  <tr key={n.id}>
                    <td>
                      <strong style={{ color: "var(--text-main)" }}>{n.title}</strong>
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                      {n.content}
                    </td>
                    <td>
                      <StatusPill tone={getPriorityTone(n.priority)}>
                        {n.priority}
                      </StatusPill>
                    </td>
                    <td style={{ whiteSpace: "nowrap", fontSize: "12px", color: "var(--text-muted)" }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
