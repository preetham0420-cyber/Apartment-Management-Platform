"use client";

import React from "react";
import { AuthUser } from "@apartment/shared";
import {
  DashboardIcon,
  PropertiesIcon,
  UnitsIcon,
  ResidentsIcon,
  MaintenanceIcon,
  VisitorsIcon,
  DuesIcon,
  AmenitiesIcon,
  NoticesIcon,
  DocumentsIcon,
  ReportsIcon,
  BuildingIcon,
  LogoutIcon
} from "./icons";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
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
      { id: "dashboard", label: "Dashboard", icon: <DashboardIcon size={18} /> }
    ]
  },
  {
    label: "PROPERTY",
    items: [
      { id: "properties", label: "Properties", icon: <PropertiesIcon size={18} /> },
      { id: "units", label: "Units", icon: <UnitsIcon size={18} /> },
      { id: "residents", label: "Residents", icon: <ResidentsIcon size={18} /> }
    ]
  },
  {
    label: "OPERATIONS",
    items: [
      { id: "maintenance", label: "Maintenance", icon: <MaintenanceIcon size={18} /> },
      { id: "visitors", label: "Visitors", icon: <VisitorsIcon size={18} /> },
      { id: "payments", label: "Dues & Payments", icon: <DuesIcon size={18} /> },
      { id: "amenities", label: "Amenities", icon: <AmenitiesIcon size={18} /> }
    ]
  },
  {
    label: "COMMUNITY",
    items: [
      { id: "notices", label: "Notices", icon: <NoticesIcon size={18} /> },
      { id: "documents", label: "Documents", icon: <DocumentsIcon size={18} /> },
      { id: "reports", label: "Reports & Audits", icon: <ReportsIcon size={18} /> }
    ]
  }
];

interface SidebarProps {
  activeTab: string;
  onSelectTab: (id: string) => void;
  open: boolean;
  onClose: () => void;
  adminUser?: AuthUser | null;
  onLogout?: () => void;
}

export function Sidebar({
  activeTab,
  onSelectTab,
  open,
  onClose,
  adminUser,
  onLogout
}: SidebarProps) {
  return (
    <>
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        {/* Brand Header */}
        <div className="sidebar-top">
          <div className="brand">
            <span className="brand-badge">AMP</span>
            <div className="brand-info">
              <span className="brand-title">Apartment OS</span>
              <span className="brand-subtitle">Commercial Operations</span>
            </div>
          </div>
          <button className="close-menu-btn" onClick={onClose} aria-label="Close navigation">
            ✕
          </button>
        </div>

        {/* Community Switcher */}
        <div className="community-selector">
          <div className="community-icon-container">
            <BuildingIcon size={16} color="var(--primary)" />
          </div>
          <div className="community-selector-text">
            <span className="community-name">Greenfield Heights</span>
            <span className="community-type">Society Operations</span>
          </div>
          <span className="community-status-dot" title="Live society" />
        </div>

        {/* Grouped Navigation */}
        <nav className="nav-container">
          {navGroups.map((group) => (
            <div key={group.label} className="nav-group">
              <div className="nav-group-title">{group.label}</div>
              <div className="nav-items-stack">
                {group.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      className={`nav-button ${isActive ? "active" : ""}`}
                      onClick={() => {
                        onSelectTab(item.id);
                        onClose();
                      }}
                    >
                      <span className="nav-icon-wrapper">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                      {isActive && <span className="nav-active-pill" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Administrator Profile Area */}
        <div className="sidebar-footer">
          <div className="admin-profile-card">
            <div className="admin-avatar">
              {adminUser?.fullName
                ? adminUser.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                : "SA"}
            </div>
            <div className="admin-profile-meta">
              <span className="admin-name">{adminUser?.fullName || "Super Admin"}</span>
              <span className="admin-role">Platform Super Admin</span>
            </div>
            {onLogout && (
              <button
                className="admin-logout-btn"
                onClick={onLogout}
                title="Sign out of Super Admin Console"
                aria-label="Sign out"
              >
                <LogoutIcon size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {open && <div className="sidebar-overlay" onClick={onClose} />}
    </>
  );
}
