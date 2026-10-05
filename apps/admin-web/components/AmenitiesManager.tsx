"use client";

import React, { useEffect, useState } from "react";
import { Amenity, AmenityBooking } from "@apartment/shared";
import { StatusPill } from "./StatusPill";
import { ConfirmationModal } from "./ConfirmationModal";
import { useToast } from "./Toast";
import { adminApi } from "../lib/api";
import { RefreshIcon, AlertTriangleIcon } from "./icons";

export function AmenitiesManager() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [bookings, setBookings] = useState<AmenityBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingFilter, setBookingFilter] = useState("ALL");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Cancellation State
  const [pendingCancellation, setPendingCancellation] = useState<{
    bookingId: string;
    amenityName: string;
    residentName: string;
  } | null>(null);

  const { success, error: toastError } = useToast();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [amenitiesData, bookingsData] = await Promise.all([
        adminApi.getAmenities(),
        adminApi.getAmenityBookings()
      ]);
      setAmenities(amenitiesData);
      setBookings(bookingsData);
    } catch (err) {
      const e = err as Error;
      setError(e.message || "Failed to load amenities data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConfirmCancel = async () => {
    if (!pendingCancellation) return;
    const { bookingId, amenityName } = pendingCancellation;
    setCancellingId(bookingId);

    try {
      await adminApi.cancelAmenityBooking(bookingId);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "CANCELLED" } : b))
      );
      success(`Booking for '${amenityName}' cancelled.`);
    } catch (err) {
      const e = err as Error;
      toastError(e.message || "Failed to cancel booking.");
    } finally {
      setCancellingId(null);
      setPendingCancellation(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter !== "ALL" && b.status !== bookingFilter) return false;
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Amenities Catalog Panel */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Shared Community Facilities & Amenities</h2>
            <p className="panel-subtitle">Manage recreation slots, capacity rules, and operational timings</p>
          </div>
          <button className="action-btn btn-outline" onClick={fetchData} disabled={loading} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <RefreshIcon size={14} />
            <span>{loading ? "Loading..." : "Refresh"}</span>
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

        {loading ? (
          <div style={{ padding: "16px 0" }}>
            <div className="skeleton-box" style={{ height: "60px", marginBottom: "12px" }} />
            <div className="skeleton-box" style={{ height: "60px" }} />
          </div>
        ) : amenities.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No amenities configured.</p>
        ) : (
          <div className="module-overview-grid">
            {amenities.map((a) => (
              <div key={a.id} className="module-card">
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: "700" }}>{a.name}</h3>
                    <StatusPill tone="green">Available</StatusPill>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "10px" }}>
                    {a.description}
                  </p>
                  <div style={{ display: "flex", gap: "14px", fontSize: "12px", background: "var(--bg-secondary)", border: "1px solid var(--border)", padding: "8px 12px", borderRadius: "6px" }}>
                    <div><strong>Capacity:</strong> {a.capacity} persons</div>
                    <div><strong>Hours:</strong> {a.openTime.slice(0, 5)} - {a.closeTime.slice(0, 5)}</div>
                  </div>
                  {a.rules && (
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px" }}>
                      <strong>Rules:</strong> {a.rules}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Community Bookings Ledger Panel */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Resident Booking Ledger</h2>
            <p className="panel-subtitle">Review scheduled slots and manage facility reservations</p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)" }}>
              STATUS:
            </label>
            <select
              className="admin-filter-select"
              value={bookingFilter}
              onChange={(e) => setBookingFilter(e.target.value)}
            >
              <option value="ALL">All Reservations ({bookings.length})</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "16px 0" }}>
            <div className="skeleton-box" style={{ height: "45px", marginBottom: "8px" }} />
            <div className="skeleton-box" style={{ height: "45px" }} />
          </div>
        ) : filteredBookings.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No booking reservations found.</p>
        ) : (
          <div className="table-responsive">
            <table className="info-table">
            <thead>
              <tr>
                <th>Facility Name</th>
                <th>Resident Member</th>
                <th>Unit / Home</th>
                <th>Reserved Time Window</th>
                <th>Booking Status</th>
                <th>Operations</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => {
                const isCancelling = cancellingId === b.id;

                return (
                  <tr key={b.id}>
                    <td>
                      <strong>{b.amenityName || "Community Amenity"}</strong>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>ID: <code>{b.id.slice(0, 14)}...</code></div>
                    </td>
                    <td>{b.residentName || "Resident"}</td>
                    <td><code>{b.unitId ? b.unitId.slice(0, 8) : "Tower A"}</code></td>
                    <td style={{ whiteSpace: "nowrap", fontSize: "12px" }}>
                      {new Date(b.startTime).toLocaleString()} - {new Date(b.endTime).toLocaleTimeString()}
                    </td>
                    <td>
                      <StatusPill tone={b.status === "CONFIRMED" ? "green" : "red"}>
                        {b.status}
                      </StatusPill>
                    </td>
                    <td>
                      {b.status === "CONFIRMED" ? (
                        <button
                          className="action-btn btn-danger"
                          disabled={isCancelling}
                          onClick={() =>
                            setPendingCancellation({
                              bookingId: b.id,
                              amenityName: b.amenityName || "Facility",
                              residentName: b.residentName || "Resident"
                            })
                          }
                        >
                          Cancel Booking
                        </button>
                      ) : (
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Cancelled</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationModal
        isOpen={Boolean(pendingCancellation)}
        title="Confirm Booking Cancellation"
        message={`Are you sure you want to cancel the reservation for '${pendingCancellation?.amenityName}' booked by ${pendingCancellation?.residentName}?`}
        confirmLabel="Cancel Reservation"
        tone="danger"
        isSubmitting={Boolean(cancellingId)}
        onConfirm={handleConfirmCancel}
        onCancel={() => setPendingCancellation(null)}
      />
    </div>
  );
}
