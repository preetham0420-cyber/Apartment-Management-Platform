import React from "react";
import { Tone } from "./StatusPill";

interface MetricCardProps {
  label: string;
  value: string;
  note?: string;
  tone?: Tone;
  icon?: string;
  onClick?: () => void;
}

export function MetricCard({ label, value, note, tone = "teal", icon, onClick }: MetricCardProps) {
  return (
    <article
      className={`metric-card ${onClick ? "clickable" : ""}`}
      onClick={onClick}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="metric-label">{label}</span>
        {icon && <span style={{ fontSize: "18px" }}>{icon}</span>}
      </div>
      <div className={`metric-value tone-${tone}`}>{value}</div>
      {note && <span className="metric-note">{note}</span>}
    </article>
  );
}
