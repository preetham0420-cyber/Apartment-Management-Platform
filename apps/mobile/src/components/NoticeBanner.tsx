import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

interface NoticeBannerProps {
  title: string;
  message: string;
}

export function NoticeBanner({ title, message }: NoticeBannerProps) {
  return (
    <View style={styles.banner}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fef3c7",
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    borderRadius: spacing.radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  title: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.bold,
    color: "#92400e",
    marginBottom: 2
  },
  message: {
    fontSize: typography.sizes.caption,
    color: "#78350f",
    lineHeight: typography.lineHeights.caption
  }
});
