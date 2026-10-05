export const colors = {
  // Brand colors: Emerald & Teal
  primary: "#159A72", // Emerald green
  primaryHover: "#128260",
  primaryLight: "#E8F4EF", // Soft emerald/sage highlight
  secondary: "#3A8F83", // Teal
  secondaryLight: "#E9F4F2",
  softBrand: "#E8F4EF",

  // Dark structural: Deep charcoal
  darkStructural: "#18201D",
  charcoal: "#18201D",
  textMain: "#18201D",
  textMuted: "#68716D",

  // Backgrounds: White dominant (70-80%)
  bgPage: "#FFFFFF",
  bgSecondary: "#F7F8F6",
  bgSurface: "#FFFFFF",

  // Borders & Dividers
  border: "#E5E8E5",
  borderSubtle: "#F0F2F0",
  borderDark: "#D4D8D4",

  // Semantics
  success: "#159A72",
  successLight: "#E8F4EF",
  warning: "#D99A22", // Amber
  warningLight: "#FBF4E7",
  danger: "#D95757", // Coral red
  dangerLight: "#FAEEEE",
  info: "#3A8F83", // Teal
  infoLight: "#E9F4F2",

  // Neutral tones for non-colored tags
  neutral: "#68716D",
  neutralLight: "#F7F8F6"
};

export type ThemeTone =
  | "green"
  | "emerald"
  | "teal"
  | "blue" // Mapped to teal (no blue)
  | "orange"
  | "warning"
  | "red"
  | "danger"
  | "violet" // Mapped to teal
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
      // In this new design system, teal replaces blue/violet for secondary accent
      return { main: colors.secondary, light: colors.secondaryLight };
  }
}
