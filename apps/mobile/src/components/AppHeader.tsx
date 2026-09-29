import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

interface AppHeaderProps {
  title?: string;
  roleBadge?: string;
  unreadNotifications?: number;
  onNotificationPress?: () => void;
}

export function AppHeader({
  title = "Community Portal",
  roleBadge = "Resident Access",
  unreadNotifications = 3,
  onNotificationPress
}: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.titleArea}>
        <View style={styles.roleChip}>
          <Text style={styles.roleChipText}>{roleBadge.toUpperCase()}</Text>
        </View>
        <Text style={styles.titleText}>{title}</Text>
      </View>

      <TouchableOpacity
        style={styles.notificationButton}
        onPress={onNotificationPress}
        activeOpacity={0.7}
        accessibilityLabel="Notifications"
      >
        <Text style={styles.bellIcon}>🔔</Text>
        {unreadNotifications > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadNotifications}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  titleArea: {
    flex: 1
  },
  roleChip: {
    alignSelf: "flex-start",
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: spacing.radius.sm,
    marginBottom: 4
  },
  roleChipText: {
    fontSize: typography.sizes.tiny,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: 0.6
  },
  titleText: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.heavy,
    color: colors.textMain
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: spacing.radius.md,
    backgroundColor: colors.bgPage,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  bellIcon: {
    fontSize: 16
  },
  badge: {
    position: "absolute",
    top: -3,
    right: -3,
    backgroundColor: colors.danger,
    borderRadius: spacing.radius.round,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: typography.weights.bold
  }
});
