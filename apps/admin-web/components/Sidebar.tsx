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
    label: "OVERVIEW",
    items: [
      { id: "dashboard", label: "Dashboard" },
      { id: "residents", label: "Residents & Homes" },
      { id: "rentals", label: "Rental Management" },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { id: "maintenance", label: "Maintenance", badge: 8 },
      { id: "payments", label: "Payments & Accounts" },
      { id: "visitors", label: "Visitors & Gate" },
      { id: "cctv", label: "CCTV & Security", badge: 3 },
      { id: "amenities", label: "Amenities" },
    ],
  },
  {
    label: "COMMUNITY",
    items: [
      { id: "chat", label: "Chat & Messages", badge: 5 },
      { id: "notices", label: "Notices & Meetings" },
      { id: "staff", label: "Staff & Vendors" },
      { id: "documents", label: "Documents" },
      { id: "reports", label: "Reports" },
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
