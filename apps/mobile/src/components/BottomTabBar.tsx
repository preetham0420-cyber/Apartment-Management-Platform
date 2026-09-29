import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

export type TabKey = "home" | "services" | "chat" | "visitors" | "more";

interface TabItem {
  key: TabKey;
  label: string;
  icon: string;
}

const tabs: TabItem[] = [
  { key: "home", label: "Home", icon: "🏠" },
  { key: "services", label: "Services", icon: "🔧" },
  { key: "chat", label: "Chat", icon: "💬" },
  { key: "visitors", label: "Visitors", icon: "🛡️" },
  { key: "more", label: "More", icon: "☰" }
];

interface BottomTabBarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export function BottomTabBar({ activeTab, onTabChange }: BottomTabBarProps) {
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text style={[styles.tabIcon, isActive && styles.activeIcon]}>
              {tab.icon}
            </Text>
            <Text style={[styles.tabLabel, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
            {isActive && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.bgSurface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.xs,
    paddingBottom: spacing.sm,
    justifyContent: "space-around"
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 4,
    position: "relative"
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
    opacity: 0.7
  },
  activeIcon: {
    opacity: 1
  },
  tabLabel: {
    fontSize: typography.sizes.tiny,
    fontWeight: typography.weights.medium,
    color: colors.textMuted
  },
  activeLabel: {
    color: colors.primary,
    fontWeight: typography.weights.bold
  },
  activeIndicator: {
    position: "absolute",
    bottom: -4,
    width: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary
  }
});
