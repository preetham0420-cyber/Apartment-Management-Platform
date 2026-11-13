import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, getToneColor, ThemeTone } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

interface StatusPillProps {
  label: string;
  tone?: ThemeTone;
}

export function StatusPill({ label, tone }: StatusPillProps) {
  const inferredTone: ThemeTone =
    tone ??
    (/paid|verified|online|current|available|inside/i.test(label)
      ? "green"
      : /overdue|critical|offline|urgent/i.test(label)
      ? "red"
      : /pending|warning|due|attention|renewal/i.test(label)
      ? "orange"
      : "teal");

  const { main, light } = getToneColor(inferredTone);

  return (
    <View style={[styles.pill, { backgroundColor: light, borderColor: main + "30" }]}>
      <View style={[styles.dot, { backgroundColor: main }]} />
      <Text style={[styles.text, { color: main }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: spacing.radius.round,
    alignSelf: "flex-start",
    borderWidth: 1
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6
  },
  text: {
    fontSize: typography.sizes.tiny,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.2
  }
});
