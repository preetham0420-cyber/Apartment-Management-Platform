"use client";

import React, { useState, useRef, useEffect } from "react";
import { AuthUser } from "@apartment/shared";
import { SearchIcon, BellIcon } from "./icons";

interface TopbarProps {
  onToggleMenu: () => void;
  title: string;
  adminUser?: AuthUser | null;
  onLogout?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  color: string;
}

const initialNotifications: NotificationItem[] = [
  {
    id: "n-1",
    title: "New Maintenance Ticket Raised",
    body: "Unit 402 reported 'Kitchen Sink Water Leakage'. Assigned to Plumbing Team.",
    time: "10m ago",
    unread: true,
    color: "#D99A22"
  },
  {
    id: "n-2",
    title: "Visitor Gate Clearance",
    body: "Amazon Delivery Agent pre-approved by resident for Tower A Unit 402.",
    time: "24m ago",
    unread: true,
    color: "#3A8F83"
  },
  {
    id: "n-3",
    title: "August Maintenance Dues",
    body: "22 homes have pending maintenance dues awaiting collection reconciliation.",
    time: "1h ago",
    unread: true,
    color: "#D95757"
  },
  {
    id: "n-4",
    title: "Notice Dispatched",
    body: "Official notice 'Scheduled Power Backup Drill' broadcasted to all residents.",
    time: "3h ago",
    unread: false,
    color: "#159A72"
  }
];

export function Topbar({ onToggleMenu, title, adminUser, onLogout }: TopbarProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    if (notificationsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationsOpen]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleToggleItem = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  return (
    <header className="topbar">
      {/* Contextual Title & Breadcrumbs */}
      <div className="topbar-left">
        <button
          className="mobile-hamburger"
          onClick={onToggleMenu}
          aria-label="Open navigation menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="topbar-context">
          <span className="topbar-breadcrumb">Greenfield Heights</span>
          <span className="topbar-breadcrumb-separator">/</span>
          <h1 className="topbar-title">{title}</h1>
        </div>
      </div>

      {/* Global Search */}
      <div className="topbar-center">
        <div className="global-search-container">
          <span className="search-icon-wrapper">
            <SearchIcon size={15} color="var(--text-muted)" />
          </span>
          <input
            type="search"
            placeholder="Search units, residents, tickets, passes..."
            aria-label="Search console"
            className="global-search-input"
          />
          <kbd className="search-shortcut">⌘K</kbd>
        </div>
      </div>

      {/* Actions & Profile */}
      <div className="topbar-right">
        {/* System Status */}
        <div className="system-status-chip">
          <span className="status-pulse-dot" />
          <span className="status-text">Operations Live</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="notifications-wrapper" ref={dropdownRef}>
          <button
            className={`topbar-icon-button ${notificationsOpen ? "active" : ""}`}
            aria-label="Notifications"
            title="View Community Notifications"
            onClick={() => setNotificationsOpen((prev) => !prev)}
          >
            <BellIcon size={18} color="var(--text-main)" />
            {unreadCount > 0 && <span className="notification-badge-dot" />}
          </button>

          {notificationsOpen && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <span className="notifications-title">Notifications ({notifications.length})</span>
                {unreadCount > 0 && (
                  <button className="notifications-clear-btn" onClick={handleMarkAllRead}>
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notifications-list">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`notification-item ${n.unread ? "unread" : ""}`}
                    onClick={() => handleToggleItem(n.id)}
                  >
                    <span
                      className="notification-indicator-dot"
                      style={{
                        backgroundColor: n.color,
                        opacity: n.unread ? 1 : 0.35
                      }}
                    />
                    <div className="notification-content">
                      <div className="notification-item-title">{n.title}</div>
                      <div className="notification-item-body">{n.body}</div>
                      <div className="notification-item-time">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Chip */}
        <div className="topbar-profile-chip">
          <div className="topbar-avatar">
            {adminUser?.fullName
              ? adminUser.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
              : "SA"}
          </div>
          <div className="topbar-profile-text">
            <span className="topbar-user-name">{adminUser?.fullName || "Super Admin"}</span>
            <span className="topbar-user-role">Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
