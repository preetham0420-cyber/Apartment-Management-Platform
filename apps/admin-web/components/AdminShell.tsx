"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { AuthUser } from "@apartment/shared";

interface AdminShellProps {
  children: (activeTab: string, onSelectTab: (tab: string) => void) => React.ReactNode;
  activeTitleMap?: Record<string, string>;
  adminUser?: AuthUser | null;
  onLogout?: () => void;
}

const defaultTitleMap: Record<string, string> = {
  dashboard: "Community Operations Dashboard",
  properties: "Properties Configuration & Infrastructure",
  units: "Units & Residential Inventory",
  residents: "Residents & Unit Assignments",
  maintenance: "Maintenance & Facility Operations",
  visitors: "Gate Desk & Visitor Log",
  payments: "Accounts & Dues Collections Ledger",
  amenities: "Shared Amenities & Facilities Booking",
  notices: "Community Notice Board & Circulars",
  reports: "Compliance, Security & Executive Audit Logs",
};

export function AdminShell({
  children,
  activeTitleMap = defaultTitleMap,
  adminUser,
  onLogout
}: AdminShellProps) {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const currentTitle = activeTitleMap[activeTab] || "Super Admin Console";

  return (
    <div className="admin-shell">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="admin-body">
        <Topbar
          onToggleMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          title={currentTitle}
          adminUser={adminUser}
          onLogout={onLogout}
        />

        <main className="admin-main">
          {children(activeTab, setActiveTab)}
        </main>
      </div>
    </div>
  );
}
