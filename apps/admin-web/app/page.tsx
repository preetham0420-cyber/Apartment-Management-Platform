import React from "react";
import { ROLE_MODEL_STATUS } from "@apartment/shared";

export default function AdminHomePage() {
  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-badge">AP</span>
          <div>
            <div className="brand-title">APARTMENT</div>
            <div className="brand-subtitle">Super Admin Console</div>
          </div>
        </div>

        <nav>
          <div className="nav-section-title">Overview</div>
          <a href="#" className="nav-link active">Dashboard</a>
          <a href="#" className="nav-link">Residents & Units</a>
          <a href="#" className="nav-link">Rental Leases</a>

          <div className="nav-section-title">Operations</div>
          <a href="#" className="nav-link">Maintenance</a>
          <a href="#" className="nav-link">Accounts & Dues</a>
          <a href="#" className="nav-link">Gate & Visitors</a>
          <a href="#" className="nav-link">Security / CCTV</a>

          <div className="nav-section-title">Community</div>
          <a href="#" className="nav-link">Notice Board</a>
          <a href="#" className="nav-link">Staff & Vendors</a>
          <a href="#" className="nav-link">Reports & Audit</a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="topbar">
          <h1 className="topbar-title">Community Administration Overview</h1>
          <div className="status-badge">
            <span className="status-dot"></span>
            Day 1 Foundation Active
          </div>
        </header>

        <main className="content-body">
          {/* Senior Developer Provisional Notice */}
          <div className="notice-banner">
            <strong>Provisional Role & Authorization Notice:</strong> {ROLE_MODEL_STATUS.statusNotes} No RBAC or authorization logic is enforced today.
          </div>

          {/* Quick Metrics Grid */}
          <section className="grid-cards">
            <div className="metric-card">
              <div className="metric-label">Architecture Foundation</div>
              <div className="metric-value">Monorepo</div>
              <div className="metric-note">Next.js 15, React 19, TypeScript</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Backend API Target</div>
              <div className="metric-value">Express 5</div>
              <div className="metric-note">Node.js 22 LTS REST/JSON</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Mobile Target</div>
              <div className="metric-value">React Native</div>
              <div className="metric-note">Expo Go Compatible (No WebView)</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Database Target</div>
              <div className="metric-value">MySQL</div>
              <div className="metric-note">Migrations & Seeders directory ready</div>
            </div>
          </section>

          {/* Foundation Status Panel */}
          <section className="panel">
            <div className="panel-header">
              <h2 className="panel-title">Repository Foundation Components</h2>
              <p className="panel-subtitle">Day 1 baseline verification across platform tiers</p>
            </div>

            <table className="info-table">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Technology</th>
                  <th>Path</th>
                  <th>Day 1 Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Tenant Mobile</strong></td>
                  <td>React Native / Expo</td>
                  <td><code>apps/mobile</code></td>
                  <td>Shell & Native Theme Ready</td>
                </tr>
                <tr>
                  <td><strong>Admin Web</strong></td>
                  <td>Next.js / TypeScript</td>
                  <td><code>apps/admin-web</code></td>
                  <td>Console Shell & Layout Ready</td>
                </tr>
                <tr>
                  <td><strong>Backend API</strong></td>
                  <td>Node 22 / Express 5</td>
                  <td><code>apps/api</code></td>
                  <td>Layered Architecture & Health API Ready</td>
                </tr>
                <tr>
                  <td><strong>Shared Package</strong></td>
                  <td>TypeScript Contracts</td>
                  <td><code>packages/shared</code></td>
                  <td>Provisional Contracts & Types</td>
                </tr>
                <tr>
                  <td><strong>Database Schema</strong></td>
                  <td>MySQL Migrations</td>
                  <td><code>database/migrations</code></td>
                  <td>Directory Initialized (Pending Day 3)</td>
                </tr>
              </tbody>
            </table>
          </section>
        </main>
      </div>
    </div>
  );
}
