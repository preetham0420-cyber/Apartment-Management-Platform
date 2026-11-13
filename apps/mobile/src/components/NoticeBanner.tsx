import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { BellIcon } from "./MobileIcons";

interface NoticeBannerProps {
  title: string;
  message: string;
}

export function NoticeBanner({ title, message }: NoticeBannerProps) {
  return (
    <View style={styles.banner}>
      <View style={styles.iconSlot}>
        <BellIcon size={16} color={colors.warning} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: spacing.radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1
  },
  iconSlot: {
    marginRight: 10,
    marginTop: 2
  },
  content: {
    flex: 1
  },
  title: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.bold,
    color: "#B45309",
    marginBottom: 2
  },
  message: {
    fontSize: typography.sizes.caption,
    color: "#92400E",
    lineHeight: 18
  }
});
