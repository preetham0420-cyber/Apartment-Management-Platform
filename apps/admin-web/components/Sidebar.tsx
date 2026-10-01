"use client";

import React from "react";

export interface NavItem {
  id: string;
  label: string;
  badge?: number;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "OVERVIEW & ASSETS",
    items: [
      { id: "dashboard", label: "Overview" },
      { id: "properties", label: "Properties" },
      { id: "units", label: "Units" },
      { id: "residents", label: "Residents" },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { id: "maintenance", label: "Maintenance" },
      { id: "visitors", label: "Visitors" },
      { id: "payments", label: "Dues / Payments" },
      { id: "amenities", label: "Amenities" },
    ],
  },
  {
    label: "COMMUNITY & COMPLIANCE",
    items: [
      { id: "documents", label: "Documents" },
      { id: "notices", label: "Notices" },
      { id: "reports", label: "Reports & Audits" },
    ],
  },
];

interface SidebarProps {
  activeTab: string;
  onSelectTab: (id: string) => void;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ activeTab, onSelectTab, open, onClose }: SidebarProps) {
  return (
    <>
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-top">
          <div className="brand">
            <span className="brand-badge">AP</span>
            <div>
              <div className="brand-title">APARTMENT</div>
              <div className="brand-subtitle">Super Admin Console</div>
            </div>
          </div>
          <button className="close-menu-btn" onClick={onClose} aria-label="Close navigation">
            ✕
          </button>
        </div>

        <div className="community-switcher">
          <div className="community-icon">CP</div>
          <div className="community-text">
            <strong>Community Portal</strong>
            <small>Residential Community</small>
          </div>
        </div>

        <nav className="nav-container">
          {navGroups.map((group) => (
            <div key={group.label} className="nav-group">
              <span className="nav-group-title">{group.label}</span>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  className={`nav-button ${activeTab === item.id ? "active" : ""}`}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                >
                  <span className="nav-label">{item.label}</span>
                  {item.badge !== undefined && <span className="nav-badge">{item.badge}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="authority-card">
            <span className="authority-dot" />
            <div>
              <strong>Super Admin Mode</strong>
              <small>System Configuration & Oversight</small>
            </div>
          </div>
        </div>
      </aside>

      {open && <div className="sidebar-overlay" onClick={onClose} />}
    </>
  );
}
