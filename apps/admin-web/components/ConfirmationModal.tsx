"use client";

import React from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "primary" | "danger" | "success";
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "primary",
  isSubmitting = false,
  onConfirm,
  onCancel
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const btnClass =
    tone === "danger"
      ? "action-btn btn-danger"
      : tone === "success"
      ? "action-btn btn-success"
      : "action-btn btn-primary";

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close-btn" onClick={onCancel} disabled={isSubmitting}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: "14px", color: "var(--text-main)", lineHeight: 1.5 }}>
            {message}
          </p>
        </div>
        <div className="modal-footer">
          <button
            className="action-btn btn-outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {cancelLabel}
          </button>
          <button
            className={btnClass}
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
