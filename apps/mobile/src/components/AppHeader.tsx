import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { BellIcon } from "./MobileIcons";

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
          <View style={styles.pulseDot} />
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
        <BellIcon size={18} color={colors.textMain} />
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
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2
  },
  titleArea: {
    flex: 1
  },
  roleChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.22)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: spacing.radius.sm,
    marginBottom: 4
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 6
  },
  roleChipText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: 0.6
  },
  titleText: {
    fontSize: 22,
    fontWeight: typography.weights.heavy,
    color: colors.textMain,
    letterSpacing: -0.4
  },
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: colors.danger,
    borderRadius: spacing.radius.round,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF"
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: typography.weights.heavy
  }
});
