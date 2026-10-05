import React from "react";

export type Tone =
  | "emerald"
  | "teal"
  | "green"
  | "blue" // Maps to teal styling in CSS
  | "orange"
  | "yellow"
  | "red"
  | "violet"
  | "charcoal"
  | "neutral";

interface StatusPillProps {
  children: React.ReactNode;
  tone?: Tone;
}

export function StatusPill({ children, tone }: StatusPillProps) {
  const inferred: Tone =
    tone ??
    (/paid|verified|online|current|available|inside|approved|active|resolved/i.test(String(children))
      ? "emerald"
      : /overdue|critical|offline|urgent|rejected|cancelled|failed|error/i.test(String(children))
      ? "red"
      : /pending|warning|due|attention|renewal|upcoming|maintenance/i.test(String(children))
      ? "orange"
      : "teal");

  return (
    <span className={`status-pill tone-${inferred}`}>
      <span className="dot" />
      {children}
    </span>
  );
}
