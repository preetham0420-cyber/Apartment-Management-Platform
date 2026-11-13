export const colors = {
  // Brand colors: Refined Emerald & Teal

  primary: "#10B981", // Modern vibrant emerald
  primaryHover: "#059669",
  primaryDark: "#047857", // Deep emerald for readable text on light backgrounds
  primaryLight: "#ECFDF5", // Soft emerald tint
  primaryMuted: "rgba(16, 185, 129, 0.12)",
  secondary: "#0D9488", // Teal accent
  secondaryLight: "#F0FDFA",
  softBrand: "#ECFDF5",

  // Dark structural: Premium slate / charcoal
  darkStructural: "#0F172A",
  charcoal: "#0F172A",
  textMain: "#0F172A",
  textMuted: "#64748B",
  textSubtle: "#94A3B8",

  // Backgrounds: Clean slate canvas with crisp white cards
  bgPage: "#F8FAFC",
  bgSecondary: "#F1F5F9",
  bgSurface: "#FFFFFF",
  bgGlass: "rgba(255, 255, 255, 0.85)",

  // Borders & Dividers
  border: "#E2E8F0",
  borderSubtle: "#F1F5F9",
  borderDark: "#CBD5E1",
  borderActive: "#10B981",

  // Semantics
  success: "#10B981",
  successLight: "#ECFDF5",
  warning: "#F59E0B", // Amber
  warningLight: "#FEF3C7",
  danger: "#EF4444", // Modern rose red
  dangerLight: "#FEE2E2",
  info: "#0D9488", // Teal
  infoLight: "#F0FDFA",

  // Neutral tones for non-colored tags
  neutral: "#64748B",
  neutralLight: "#F1F5F9",

  // Modern Accent Tones for Gen-Z Flair
  accentPurple: "#8B5CF6",
  accentPurpleLight: "#F5F3FF",
  accentIndigo: "#6366F1",
  accentIndigoLight: "#EEF2FF"
};

export type ThemeTone =
  | "green"
  | "emerald"
  | "teal"
  | "blue" // Mapped to teal
  | "orange"
  | "warning"
  | "red"
  | "danger"
  | "violet"
  | "charcoal"
  | "neutral";

export function getToneColor(tone: ThemeTone) {
  switch (tone) {
    case "green":
    case "emerald":
      return { main: colors.success, light: colors.successLight };
    case "orange":
    case "warning":
      return { main: colors.warning, light: colors.warningLight };
    case "red":
    case "danger":
      return { main: colors.danger, light: colors.dangerLight };
    case "charcoal":
      return { main: colors.charcoal, light: colors.borderSubtle };
    case "neutral":
      return { main: colors.neutral, light: colors.neutralLight };
    case "teal":
    case "blue":
    case "violet":
    default:
      return { main: colors.secondary, light: colors.secondaryLight };
  }
}
