import React from "react";
import { Tone } from "./StatusPill";

interface MetricCardProps {
  label: string;
  value: string;
  note?: string;
  tone?: Tone;
}

export function MetricCard({ label, value, note, tone = "blue" }: MetricCardProps) {
  return (
    <article className="metric-card">
      <span className="metric-label">{label}</span>
      <div className={`metric-value tone-${tone}`}>{value}</div>
      {note && <span className="metric-note">{note}</span>}
    </article>
  );
}
