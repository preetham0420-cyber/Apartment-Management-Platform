"use client";

import React from "react";
import { AuthUser } from "@apartment/shared";

interface TopbarProps {
  onToggleMenu: () => void;
  title: string;
  adminUser?: AuthUser | null;
  onLogout?: () => void;
}

export function Topbar({ onToggleMenu, title, adminUser, onLogout }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="mobile-hamburger"
          onClick={onToggleMenu}
          aria-label="Open navigation menu"
        >
          ☰
        </button>
        <h1 className="topbar-title">{title}</h1>
      </div>

      <div className="topbar-center">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="search"
            placeholder="Search units, residents, tickets..."
            aria-label="Search console"
            className="search-input"
          />
        </div>
      </div>

      <div className="topbar-right">
        <div className="status-indicator">
          <span className="live-dot" />
          <span>Console Online</span>
        </div>

        <button className="topbar-icon-button" aria-label="Notifications" title="Notifications">
          🔔
          <span className="notification-count">4</span>
        </button>

        <div className="profile-chip">
          <span className="profile-avatar">
            {adminUser ? adminUser.fullName.charAt(0).toUpperCase() : "SA"}
          </span>
          <div className="profile-info">
            <strong>{adminUser ? adminUser.fullName : "Administrator"}</strong>
            <small>{adminUser ? adminUser.role : "Super Admin Authority"}</small>
          </div>
        </div>

        {onLogout && (
          <button
            className="logout-button"
            onClick={onLogout}
            title="Sign out of Super Admin Console"
            aria-label="Sign out"
          >
            Sign Out
          </button>
        )}
      </div>
    </header>
  );
}
