"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { AuditLog } from "@apartment/shared";
import { StatusPill } from "./StatusPill";
import { adminApi } from "../lib/api";
import { RefreshIcon, AlertTriangleIcon, SearchIcon, AuditIcon } from "./icons";

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [resourceFilter, setResourceFilter] = useState("ALL");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getAuditLogs();
      setLogs(data);
    } catch (err) {
      const e = err as Error;
      setError(e.message || "Failed to load audit trail");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Extract unique actions & resource types for filter dropdowns
  const uniqueActions = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => {
      if (l.action) set.add(l.action);
    });
    return Array.from(set).sort();
  }, [logs]);

  const uniqueResources = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => {
      if (l.resourceType) set.add(l.resourceType);
    });
    return Array.from(set).sort();
  }, [logs]);

  // Sanitize details to never expose secrets/passwords/tokens
  const sanitizeDetails = (details: unknown): string => {
    if (!details) return "—";
    try {
      const obj = typeof details === "object" ? { ...(details as Record<string, unknown>) } : null;
      if (obj) {
        const sensitiveKeys = ["password", "token", "jwt", "secret", "authorization", "apiKey"];
        for (const k of Object.keys(obj)) {
          if (sensitiveKeys.some((s) => k.toLowerCase().includes(s))) {
            obj[k] = "[REDACTED]";
          }
        }
        return JSON.stringify(obj, null, 1).replace(/[\{\}"]/g, "").trim();
      }
      return String(details);
    } catch {
      return "—";
    }
  };

  const filteredLogs = logs.filter((log) => {
    const q = search.toLowerCase();
    const detailsStr = typeof log.details === "object" ? JSON.stringify(log.details) : String(log.details || "");
    const matchesSearch =
      log.action.toLowerCase().includes(q) ||
      log.resourceType.toLowerCase().includes(q) ||
      (log.actorEmail && log.actorEmail.toLowerCase().includes(q)) ||
      (log.actorId && log.actorId.toLowerCase().includes(q)) ||
      (log.ipAddress && log.ipAddress.includes(q)) ||
      detailsStr.toLowerCase().includes(q);

    const matchesAction = actionFilter === "ALL" || log.action === actionFilter;
    const matchesResource = resourceFilter === "ALL" || log.resourceType === resourceFilter;

    return matchesSearch && matchesAction && matchesResource;
  });

  const getActionTone = (action: string): "teal" | "green" | "orange" | "red" => {
    if (action.includes("DELETE") || action.includes("CANCEL") || action.includes("INACTIVE")) return "red";
    if (action.includes("CREATE") || action.includes("ADD") || action.includes("ACTIVE") || action.includes("RESOLVE")) return "green";
    if (action.includes("UPDATE") || action.includes("STATUS") || action.includes("PATCH")) return "orange";
    if (action.includes("LOGIN") || action.includes("AUTH")) return "teal";
    return "teal";
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Compliance, Security & Executive Audit Logs</h2>
          <p className="panel-subtitle">
            Immutable, append-only record of all administrative operations, security mutations, and access events
          </p>
        </div>
        <button className="action-btn btn-outline" onClick={fetchLogs} disabled={loading} style={{ fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <RefreshIcon size={14} />
          <span>{loading ? "Refreshing..." : "Refresh Trail"}</span>
        </button>
      </div>

      {error && (
        <div className="feedback-banner error">
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <AlertTriangleIcon size={14} color="#D95757" />
            <span>{error}</span>
          </span>
          <button
            onClick={fetchLogs}
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

      {/* Filter & Search Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <SearchIcon size={15} color="#68716D" />
          <input
            type="text"
            placeholder="Search by actor, action, resource, IP, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="admin-filter-group">
          <label>Action:</label>
          <select
            className="admin-filter-select"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="ALL">All Actions ({uniqueActions.length})</option>
            {uniqueActions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-filter-group">
          <label>Resource:</label>
          <select
            className="admin-filter-select"
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
          >
            <option value="ALL">All Resources ({uniqueResources.length})</option>
            {uniqueResources.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginLeft: "auto", fontSize: "12px", color: "var(--text-muted)" }}>
          Showing <strong>{filteredLogs.length}</strong> of <strong>{logs.length}</strong> logged events
        </div>
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          Loading security audit trail...
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="empty-state-box">
          <div style={{ marginBottom: "8px" }}>
            <AuditIcon size={36} color="#159A72" />
          </div>
          <p style={{ margin: "8px 0 0 0", fontWeight: 600 }}>No audit logs found matching criteria.</p>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
            Try clearing your search query or adjusting your filters.
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="info-table">
            <thead>
              <tr>
                <th style={{ width: "16%" }}>Timestamp</th>
                <th style={{ width: "16%" }}>Actor / Principal</th>
                <th style={{ width: "16%" }}>Action</th>
                <th style={{ width: "14%" }}>Resource Target</th>
                <th style={{ width: "10%" }}>Source IP</th>
                <th style={{ width: "28%" }}>Event Details & Context</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ whiteSpace: "nowrap", fontSize: "12px", color: "var(--text-muted)" }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--text-main)" }}>
                      {log.actorEmail || "Super Admin"}
                    </div>
                    {log.actorId && (
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        ID: {log.actorId.slice(0, 12)}...
                      </div>
                    )}
                  </td>
                  <td>
                    <StatusPill tone={getActionTone(log.action)}>{log.action}</StatusPill>
                  </td>
                  <td>
                    <div style={{ fontSize: "12px", fontWeight: 600 }}>{log.resourceType}</div>
                    {log.resourceId && (
                      <code
                        style={{
                          fontSize: "11px",
                          background: "#f1f5f9",
                          padding: "1px 4px",
                          borderRadius: "3px",
                          color: "#475569"
                        }}
                      >
                        {log.resourceId.slice(0, 14)}
                      </code>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", fontFamily: "monospace", color: "var(--text-muted)" }}>
                      {log.ipAddress || "127.0.0.1"}
                    </span>
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text-muted)", wordBreak: "break-word" }}>
                    <div
                      style={{
                        maxHeight: "60px",
                        overflowY: "auto",
                        background: "#fafafa",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        border: "1px solid #f1f5f9",
                        fontSize: "11px",
                        fontFamily: "monospace"
                      }}
                    >
                      {sanitizeDetails(log.details)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
