export const colors = {
  primary: "#5b6cf9",
  primaryHover: "#4856e0",
  primaryLight: "rgba(91, 108, 249, 0.1)",
  success: "#18a775",
  successLight: "rgba(24, 167, 117, 0.12)",
  warning: "#f59e45",
  warningLight: "rgba(245, 158, 69, 0.12)",
  danger: "#e95b64",
  dangerLight: "rgba(233, 91, 100, 0.12)",
  violet: "#8b5cf6",
  violetLight: "rgba(139, 92, 246, 0.12)",
  textMain: "#0f172a",
  textMuted: "#64748b",
  bgPage: "#f8fafc",
  bgSurface: "#ffffff",
  border: "#e2e8f0",
  borderDark: "#cbd5e1"
};

export type ThemeTone = "blue" | "green" | "orange" | "red" | "violet";

export function getToneColor(tone: ThemeTone) {
  switch (tone) {
    case "green":
      return { main: colors.success, light: colors.successLight };
    case "orange":
      return { main: colors.warning, light: colors.warningLight };
    case "red":
      return { main: colors.danger, light: colors.dangerLight };
    case "violet":
      return { main: colors.violet, light: colors.violetLight };
    case "blue":
    default:
      return { main: colors.primary, light: colors.primaryLight };
  }
}
