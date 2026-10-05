"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Document, DocumentCategory, DocumentAccessLevel } from "@apartment/shared";
import { adminApi } from "../lib/api";
import { useToast } from "./Toast";
import { ConfirmationModal } from "./ConfirmationModal";
import { SearchIcon } from "./icons";

const CATEGORIES: { label: string; value: DocumentCategory }[] = [
  { label: "Bylaws & Rules", value: "APARTMENT_BYLAWS" },
  { label: "Fire Safety & NOC", value: "FIRE_SAFETY" },
  { label: "Lift AMC & Engineering", value: "LIFT_AMC" },
  { label: "AGM Minutes", value: "AGM_MINUTES" },
  { label: "Financial Audits", value: "FINANCIAL_AUDIT" },
  { label: "Other Documents", value: "OTHER" }
];

export function DocumentsManager() {
  const { success, error: toastError } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("APARTMENT_BYLAWS");
  const [accessLevel, setAccessLevel] = useState<DocumentAccessLevel>("ALL_RESIDENTS");
  const [fileUrl, setFileUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await adminApi.getDocuments();
      setDocuments(data);
    } catch (err) {
      const e = err as Error;
      setFetchError(e.message || "Failed to load compliance documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError("Document title is required.");
      return;
    }
    const finalUrl = fileUrl.trim() || `/documents/${title.trim().toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf`;

    setIsSubmitting(true);
    setFormError(null);

    try {
      const created = await adminApi.createDocument({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        accessLevel,
        fileUrl: finalUrl,
        fileSize: 1048576, // 1.0 MB default simulated size
        mimeType: "application/pdf"
      });

      setDocuments((prev) => [created, ...prev]);
      success(`Document "${created.title}" successfully registered in Compliance Centre.`);
      setIsUploadOpen(false);
      setTitle("");
      setDescription("");
      setFileUrl("");
      setCategory("APARTMENT_BYLAWS");
      setAccessLevel("ALL_RESIDENTS");
    } catch (err) {
      const e = err as Error;
      const msg = e.message || "Failed to upload document.";
      setFormError(msg);
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteDocument(deleteTarget.id);
      setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      success(`Document "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      const e = err as Error;
      toastError(e.message || "Failed to delete document.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      (doc.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "ALL" || doc.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const getAccessBadgeClass = (level: DocumentAccessLevel) => {
    if (level === "ALL_RESIDENTS") return "badge-success";
    if (level === "OWNERS_ONLY") return "badge-warning";
    return "badge-danger";
  };

  return (
    <div className="section-container">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">Documents & Compliance Centre</h1>
          <p className="section-subtitle">
            Statutory records, bylaws, AMC contracts, AGM minutes, and society compliance certificates
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setFormError(null);
            setIsUploadOpen(true);
          }}
        >
          + Upload Document
        </button>
      </div>

      {/* Filter and Category Tabs */}
      <div className="admin-filter-bar" style={{ marginTop: "1rem" }}>
        <div className="admin-search-box">
          <SearchIcon size={15} color="#68716D" />
          <input
            type="text"
            placeholder="Search documents by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)" }}>
            CATEGORY:
          </label>
          <select
            className="admin-filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {fetchError && (
        <div className="empty-state error" style={{ margin: "1rem 0" }}>
          <p>{fetchError}</p>
          <button className="btn btn-secondary" onClick={loadDocuments}>
            Retry Loading
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-state" style={{ padding: "3rem", textAlign: "center" }}>
          <p>Loading compliance documents...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="empty-state" style={{ padding: "3rem", textAlign: "center" }}>
          <p>No documents found matching your filter criteria.</p>
        </div>
      ) : (
        <div className="table-container" style={{ marginTop: "1.5rem" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Document Title</th>
                <th>Category</th>
                <th>Access Level</th>
                <th>Size</th>
                <th>Upload Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{doc.title}</div>
                    {doc.description && (
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        {doc.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-secondary">{doc.category.replace(/_/g, " ")}</span>
                  </td>
                  <td>
                    <span className={`badge ${getAccessBadgeClass(doc.accessLevel)}`}>
                      {doc.accessLevel === "ALL_RESIDENTS"
                        ? "All Residents"
                        : doc.accessLevel === "OWNERS_ONLY"
                        ? "Owners Only"
                        : "Admin Only"}
                    </span>
                  </td>
                  <td>{formatFileSize(doc.fileSize)}</td>
                  <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-secondary"
                        style={{ textDecoration: "none" }}
                      >
                        View / Download
                      </a>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => setDeleteTarget(doc)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "560px" }}>
            <div className="modal-header">
              <h2>Upload Compliance Document</h2>
              <button
                className="close-button"
                onClick={() => setIsUploadOpen(false)}
                disabled={isSubmitting}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUploadSubmit}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {formError && (
                  <div
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "#fee2e2",
                      color: "#991b1b",
                      borderRadius: "6px",
                      fontSize: "0.875rem"
                    }}
                  >
                    {formError}
                  </div>
                )}
                <div>
                  <label className="form-label">Document Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Master Security Contract 2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Access / Visibility Level *</label>
                  <select
                    className="form-select"
                    value={accessLevel}
                    onChange={(e) => setAccessLevel(e.target.value as DocumentAccessLevel)}
                  >
                    <option value="ALL_RESIDENTS">All Residents (Tenants & Owners)</option>
                    <option value="OWNERS_ONLY">Owners Only (Filtered from Tenants)</option>
                    <option value="ADMIN_ONLY">Admin Only (Strict Super Admin)</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">File Storage URL / Reference</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="/documents/filename.pdf"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                  />
                  <small style={{ color: "#64748b", marginTop: "4px", display: "block" }}>
                    Standard PDF, JPEG, or PNG format
                  </small>
                </div>
                <div>
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Brief description of the document, authority, or purpose..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsUploadOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Uploading..." : "Save & Register"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmationModal
          isOpen={true}
          title="Delete Compliance Document"
          message={`Are you sure you want to permanently remove "${deleteTarget.title}"? This action will be logged in the immutable security audit log.`}
          confirmLabel={isDeleting ? "Deleting..." : "Delete Document"}
          cancelLabel="Cancel"
          tone="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
