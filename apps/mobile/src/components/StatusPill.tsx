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
      : "blue");

  const { main, light } = getToneColor(inferredTone);

  return (
    <View style={[styles.pill, { backgroundColor: light }]}>
      <View style={[styles.dot, { backgroundColor: main }]} />
      <Text style={[styles.text, { color: main }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: spacing.radius.round,
    alignSelf: "flex-start"
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5
  },
  text: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.semibold
  }
});
