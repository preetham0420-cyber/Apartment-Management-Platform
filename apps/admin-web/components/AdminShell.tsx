"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AdminShellProps {
  children: (activeTab: string) => React.ReactNode;
  activeTitleMap?: Record<string, string>;
}

const defaultTitleMap: Record<string, string> = {
  dashboard: "Community Operations Dashboard",
  residents: "Residents & Units Directory",
  rentals: "Rental Management & Leases",
  maintenance: "Maintenance Operations Centre",
  payments: "Accounts & Collections Overview",
  visitors: "Gate Desk & Visitor Log",
  cctv: "Security & CCTV Infrastructure",
  amenities: "Shared Amenities & Facilities",
  chat: "Administrative Communication",
  notices: "Community Notice Board",
  staff: "Facility Staff & Trusted Vendors",
  documents: "Compliance & Document Centre",
  reports: "Executive Reports & Audit Logs",
};

export function AdminShell({ children, activeTitleMap = defaultTitleMap }: AdminShellProps) {
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
        />

        <main className="admin-main">
          {children(activeTab)}
        </main>
      </div>
    </div>
  );
}
