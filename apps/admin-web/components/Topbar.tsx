import React, { useState, useRef, useEffect } from "react";
import { AuthUser } from "@apartment/shared";

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
    color: "#f59e45"
  },
  {
    id: "n-2",
    title: "Visitor Gate Clearance",
    body: "Amazon Delivery Agent pre-approved by resident for Tower A Unit 402.",
    time: "24m ago",
    unread: true,
    color: "#5b6cf9"
  },
  {
    id: "n-3",
    title: "August Maintenance Dues",
    body: "22 homes have pending maintenance dues awaiting collection reconciliation.",
    time: "1h ago",
    unread: true,
    color: "#e95b64"
  },
  {
    id: "n-4",
    title: "Notice Dispatched",
    body: "Official notice 'Scheduled Power Backup Drill' broadcasted to all residents.",
    time: "3h ago",
    unread: false,
    color: "#18a775"
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

        <div className="notifications-wrapper" ref={dropdownRef}>
          <button
            className="topbar-icon-button"
            aria-label="Notifications"
            title="View Community Notifications"
            onClick={() => setNotificationsOpen((prev) => !prev)}
            style={{
              background: notificationsOpen ? "var(--primary-light)" : undefined,
              borderColor: notificationsOpen ? "var(--primary)" : undefined
            }}
          >
            🔔
            {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
          </button>

          {notificationsOpen && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h4>Notifications ({notifications.length})</h4>
                {unreadCount > 0 && (
                  <button className="notifications-clear-btn" onClick={handleMarkAllRead}>
                    Mark all as read
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
                      className="notification-dot"
                      style={{
                        backgroundColor: n.color,
                        opacity: n.unread ? 1 : 0.4
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div className="notification-title">{n.title}</div>
                      <div className="notification-body">{n.body}</div>
                      <div className="notification-time">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

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
