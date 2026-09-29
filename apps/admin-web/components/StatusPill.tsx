import React from "react";

export type Tone = "blue" | "green" | "orange" | "red" | "violet" | "yellow";

interface StatusPillProps {
  children: React.ReactNode;
  tone?: Tone;
}

export function StatusPill({ children, tone }: StatusPillProps) {
  const inferred: Tone =
    tone ??
    (/paid|verified|online|current|available|inside/i.test(String(children))
      ? "green"
      : /overdue|critical|offline|urgent/i.test(String(children))
      ? "red"
      : /pending|warning|due|attention|renewal/i.test(String(children))
      ? "orange"
      : "blue");

  return (
    <span className={`status-pill tone-${inferred}`}>
      <span className="dot" />
      {children}
    </span>
  );
}
