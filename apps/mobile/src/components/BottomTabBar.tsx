import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import {
  HomeIcon,
  WrenchIcon,
  MessageIcon,
  ShieldIcon,
  MenuIcon
} from "./MobileIcons";

export type TabKey = "home" | "services" | "chat" | "visitors" | "more";

interface TabItem {
  key: TabKey;
  label: string;
  renderIcon: (color: string) => React.ReactNode;
}

const tabs: TabItem[] = [
  {
    key: "home",
    label: "Home",
    renderIcon: (color) => <HomeIcon size={20} color={color} strokeWidth={2.1} />
  },
  {
    key: "services",
    label: "Services",
    renderIcon: (color) => <WrenchIcon size={20} color={color} strokeWidth={2.1} />
  },
  {
    key: "chat",
    label: "Chat",
    renderIcon: (color) => <MessageIcon size={20} color={color} strokeWidth={2.1} />
  },
  {
    key: "visitors",
    label: "Visitors",
    renderIcon: (color) => <ShieldIcon size={20} color={color} strokeWidth={2.1} />
  },
  {
    key: "more",
    label: "More",
    renderIcon: (color) => <MenuIcon size={20} color={color} strokeWidth={2.1} />
  }
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
        const iconColor = isActive ? colors.primary : colors.textMuted;

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            {isActive && <View style={styles.activePill} />}
            <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
              {tab.renderIcon(iconColor)}
            </View>
            <Text style={[styles.tabLabel, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
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
    paddingTop: 8,
    paddingBottom: 14,
    justifyContent: "space-around",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    minHeight: 46,
    position: "relative"
  },
  activePill: {
    position: "absolute",
    top: -8,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary
  },
  iconWrapper: {
    width: 32,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2
  },
  iconWrapperActive: {
    transform: [{ scale: 1.05 }]
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
    color: colors.textMuted,
    letterSpacing: 0.2
  },
  activeLabel: {
    color: colors.primary,
    fontWeight: typography.weights.bold
  }
});
