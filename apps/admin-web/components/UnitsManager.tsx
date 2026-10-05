"use client";

import React, { useEffect, useState } from "react";
import { UnitDetail, HouseholdMember, Vehicle, ParkingSlot } from "@apartment/shared";
import { StatusPill } from "./StatusPill";
import { ConfirmationModal } from "./ConfirmationModal";
import { useToast } from "./Toast";
import { adminApi } from "../lib/api";
import { RefreshIcon, AlertTriangleIcon, SearchIcon } from "./icons";

export function UnitsManager() {
  const [units, setUnits] = useState<UnitDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Unit Inspection State (Household, Vehicles & Parking)
  const [inspectedUnit, setInspectedUnit] = useState<UnitDetail | null>(null);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [unitVehicles, setUnitVehicles] = useState<Vehicle[]>([]);
  const [allParkingSlots, setAllParkingSlots] = useState<ParkingSlot[]>([]);
  const [loadingInspection, setLoadingInspection] = useState(false);
  const [selectedSlotToAssign, setSelectedSlotToAssign] = useState<string>("");

  // Status Change Confirmation Dialog State
  const [pendingChange, setPendingChange] = useState<{
    unitId: string;
    unitNumber: string;
    nextStatus: "OCCUPIED" | "VACANT" | "UNDER_MAINTENANCE";
  } | null>(null);

  const { success, error: toastError } = useToast();

  const fetchUnits = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getUnits();
      setUnits(data);
    } catch (err) {
      const e = err as Error;
      setError(e.message || "Failed to load units inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleConfirmStatusChange = async () => {
    if (!pendingChange) return;
    const { unitId, nextStatus, unitNumber } = pendingChange;
    setUpdatingId(unitId);

    try {
      await adminApi.updateUnitStatus(unitId, nextStatus);
      setUnits((prev) =>
        prev.map((u) => (u.id === unitId ? { ...u, status: nextStatus } : u))
      );
      success(`Unit ${unitNumber} status updated to ${nextStatus}.`);
    } catch (err) {
      const e = err as Error;
      toastError(e.message || "Failed to update unit status.");
    } finally {
      setUpdatingId(null);
      setPendingChange(null);
    }
  };

  const openInspectionModal = async (unit: UnitDetail) => {
    setInspectedUnit(unit);
    setLoadingInspection(true);
    try {
      const [hh, vehs, slots] = await Promise.all([
        adminApi.getUnitHousehold(unit.id),
        adminApi.getVehicles(),
        adminApi.getParking()
      ]);
      setHouseholdMembers(hh);
      setUnitVehicles(vehs.filter((v) => v.unitId === unit.id));
      setAllParkingSlots(slots);
    } catch (err) {
      const e = err as Error;
      toastError(e.message || "Failed to load unit details.");
    } finally {
      setLoadingInspection(false);
    }
  };

  const handleAssignParking = async () => {
    if (!inspectedUnit || !selectedSlotToAssign) return;
    try {
      await adminApi.assignParkingSlot(selectedSlotToAssign, inspectedUnit.id);
      success("Parking slot assigned to unit.");
      setSelectedSlotToAssign("");
      const updatedSlots = await adminApi.getParking();
      setAllParkingSlots(updatedSlots);
    } catch (err) {
      const e = err as Error;
      toastError(e.message || "Failed to assign parking slot.");
    }
  };

  const handleUnassignParking = async (slotId: string) => {
    try {
      await adminApi.assignParkingSlot(slotId, null);
      success("Parking slot unassigned.");
      const updatedSlots = await adminApi.getParking();
      setAllParkingSlots(updatedSlots);
    } catch (err) {
      const e = err as Error;
      toastError(e.message || "Failed to unassign parking slot.");
    }
  };

  const filteredUnits = units.filter((u) => {
    const q = search.toLowerCase();
    const matchesQuery =
      u.unitNumber.toLowerCase().includes(q) ||
      u.block.toLowerCase().includes(q) ||
      (u.residentName && u.residentName.toLowerCase().includes(q)) ||
      u.unitType.toLowerCase().includes(q);

    if (statusFilter !== "ALL" && u.status !== statusFilter) return false;
    return matchesQuery;
  });

  const getStatusTone = (status: string): "emerald" | "teal" | "orange" => {
    switch (status) {
      case "OCCUPIED":
        return "emerald";
      case "VACANT":
        return "teal";
      default:
        return "orange";
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Units & Residential Inventory</h2>
          <p className="panel-subtitle">Manage flat occupancy, structural configurations, and resident tenancy</p>
        </div>
        <button className="action-btn btn-outline" onClick={fetchUnits} disabled={loading} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <RefreshIcon size={14} />
          <span>{loading ? "Loading..." : "Refresh Units"}</span>
        </button>
      </div>

      {error && (
        <div className="feedback-banner error">
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <AlertTriangleIcon size={14} color="#D95757" />
            <span>{error}</span>
          </span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <SearchIcon size={15} color="#68716D" />
          <input
            type="text"
            placeholder="Search by unit number, block, resident..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)" }}>
            STATUS:
          </label>
          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All ({units.length})</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="VACANT">Vacant</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
          </select>
        </div>

        <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Showing <strong>{filteredUnits.length}</strong> of <strong>{units.length}</strong> flats
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "16px 0" }}>
          <div className="skeleton-box" style={{ height: "45px", marginBottom: "8px" }} />
          <div className="skeleton-box" style={{ height: "45px", marginBottom: "8px" }} />
          <div className="skeleton-box" style={{ height: "45px" }} />
        </div>
      ) : filteredUnits.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No units match the filter criteria.</p>
      ) : (
        <div className="table-responsive">
        <table className="info-table">
          <thead>
            <tr>
              <th>Unit / Flat</th>
              <th>Block & Floor</th>
              <th>Layout Type</th>
              <th>Area (Sq Ft)</th>
              <th>Occupancy Status</th>
              <th>Assigned Resident</th>
              <th>Quick Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUnits.map((u) => {
              const isUpdating = updatingId === u.id;

              return (
                <tr key={u.id}>
                  <td>
                    <strong>Unit {u.unitNumber}</strong>
                  </td>
                  <td>
                    <span>{u.block} • Floor {u.floor}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", padding: "2px 6px", background: "#f1f5f9", borderRadius: "4px" }}>
                      {u.unitType}
                    </span>
                  </td>
                  <td>{u.squareFeet ? `${u.squareFeet} sqft` : "—"}</td>
                  <td>
                    <StatusPill tone={getStatusTone(u.status)}>{u.status}</StatusPill>
                  </td>
                  <td>
                    {u.residentName ? (
                      <div>
                        <strong>{u.residentName}</strong>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{u.residentEmail}</div>
                      </div>
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "12px" }}>
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        className="action-btn btn-outline"
                        onClick={() => openInspectionModal(u)}
                      >
                        Inspect
                      </button>
                      {u.status !== "OCCUPIED" && (
                        <button
                          className="action-btn btn-success"
                          disabled={isUpdating}
                          onClick={() =>
                            setPendingChange({
                              unitId: u.id,
                              unitNumber: u.unitNumber,
                              nextStatus: "OCCUPIED"
                            })
                          }
                        >
                          Mark Occupied
                        </button>
                      )}
                      {u.status !== "VACANT" && (
                        <button
                          className="action-btn btn-outline"
                          disabled={isUpdating}
                          onClick={() =>
                            setPendingChange({
                              unitId: u.id,
                              unitNumber: u.unitNumber,
                              nextStatus: "VACANT"
                            })
                          }
                        >
                          Mark Vacant
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      )}

      {/* Unit Inspection Modal (Household, Vehicles & Parking) */}
      {inspectedUnit && (
        <div className="modal-backdrop" onClick={() => setInspectedUnit(null)}>
          <div className="modal-card" style={{ maxWidth: "780px", width: "95%" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                Unit Inspection: Flat {inspectedUnit.unitNumber} ({inspectedUnit.block})
              </h3>
              <button className="modal-close-btn" onClick={() => setInspectedUnit(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {loadingInspection ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>Loading unit data...</div>
              ) : (
                <>
                  {/* Primary Resident Info */}
                  <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong style={{ fontSize: "15px" }}>Primary Resident: {inspectedUnit.residentName || "No resident assigned"}</strong>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>{inspectedUnit.residentEmail}</div>
                      </div>
                      <StatusPill tone={getStatusTone(inspectedUnit.status)}>{inspectedUnit.status}</StatusPill>
                    </div>
                  </div>

                  {/* Phase 2: Household Members */}
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b", marginBottom: "8px" }}>
                      Household Members ({householdMembers.length})
                    </h4>
                    {householdMembers.length === 0 ? (
                      <p style={{ fontSize: "13px", color: "#64748b", fontStyle: "italic" }}>
                        No household members registered by the resident.
                      </p>
                    ) : (
                      <table className="data-table" style={{ fontSize: "13px" }}>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Relationship</th>
                            <th>Phone</th>
                            <th>Emergency Contact</th>
                          </tr>
                        </thead>
                        <tbody>
                          {householdMembers.map((m) => (
                            <tr key={m.id}>
                              <td><strong>{m.fullName}</strong></td>
                              <td>{m.relationship}</td>
                              <td>{m.phoneNumber || "—"}</td>
                              <td>
                                {m.isEmergencyContact ? (
                                  <span className="badge badge-warning" style={{ fontSize: "11px" }}>Emergency Contact</span>
                                ) : (
                                  "No"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Phase 3: Vehicles & Parking */}
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b", marginBottom: "8px" }}>
                      Registered Vehicles ({unitVehicles.length})
                    </h4>
                    {unitVehicles.length === 0 ? (
                      <p style={{ fontSize: "13px", color: "#64748b", fontStyle: "italic" }}>
                        No vehicles registered for this unit.
                      </p>
                    ) : (
                      <table className="data-table" style={{ fontSize: "13px" }}>
                        <thead>
                          <tr>
                            <th>Vehicle Number</th>
                            <th>Type</th>
                            <th>Make / Model</th>
                            <th>Assigned Slot</th>
                          </tr>
                        </thead>
                        <tbody>
                          {unitVehicles.map((v) => (
                            <tr key={v.id}>
                              <td><code>{v.vehicleNumber}</code></td>
                              <td><span className="badge badge-secondary">{v.vehicleType}</span></td>
                              <td>{v.makeModel || "—"}</td>
                              <td><strong>{v.parkingSlotNumber || "Unassigned"}</strong></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Assigned Parking Slots Management */}
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b", marginBottom: "8px" }}>
                      Assigned Parking Slots
                    </h4>
                    {allParkingSlots.filter((s) => s.unitId === inspectedUnit.id).length === 0 ? (
                      <p style={{ fontSize: "13px", color: "#64748b", fontStyle: "italic" }}>
                        No parking slots currently allocated to this flat.
                      </p>
                    ) : (
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                        {allParkingSlots
                          .filter((s) => s.unitId === inspectedUnit.id)
                          .map((slot) => (
                            <div
                              key={slot.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                background: "#f0fdf4",
                                border: "1px solid #bbf7d0",
                                padding: "6px 12px",
                                borderRadius: "6px"
                              }}
                            >
                              <strong>{slot.slotNumber}</strong> ({slot.levelLocation})
                              <button
                                className="action-btn btn-danger"
                                style={{ padding: "2px 6px", fontSize: "11px" }}
                                onClick={() => handleUnassignParking(slot.id)}
                              >
                                Revoke
                              </button>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Allocate Slot Selector */}
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "8px" }}>
                      <select
                        className="form-select"
                        style={{ maxWidth: "260px" }}
                        value={selectedSlotToAssign}
                        onChange={(e) => setSelectedSlotToAssign(e.target.value)}
                      >
                        <option value="">-- Allocate Available Slot --</option>
                        {allParkingSlots
                          .filter((s) => !s.unitId)
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.slotNumber} ({s.levelLocation})
                            </option>
                          ))}
                      </select>
                      <button
                        className="action-btn btn-primary"
                        disabled={!selectedSlotToAssign}
                        onClick={handleAssignParking}
                      >
                        Assign Slot
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="action-btn btn-outline" onClick={() => setInspectedUnit(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationModal
        isOpen={Boolean(pendingChange)}
        title="Confirm Unit Status Transition"
        message={`Are you sure you want to change the status of Unit ${pendingChange?.unitNumber} to '${pendingChange?.nextStatus}'?`}
        confirmLabel="Confirm Status Change"
        tone="primary"
        isSubmitting={Boolean(updatingId)}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setPendingChange(null)}
      />
    </div>
  );
}
