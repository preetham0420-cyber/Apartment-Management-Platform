import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
    label: "My Gate",
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
  const insets = useSafeAreaInsets();
  // Ensure tab items and labels sit safely above Android 3-button navigation (48dp) or gesture bar (~20dp)
  const bottomInset = (insets.bottom > 0 ? insets.bottom : (Platform.OS === "android" ? 48 : 0)) + 6;

  return (
    <View style={[styles.tabBar, { paddingBottom: bottomInset }]}>
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
    justifyContent: "space-around",
    elevation: 12,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    minHeight: 48,
    position: "relative"
  },
  activePill: {
    position: "absolute",
    top: -8,
    width: 28,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: colors.primary
  },
  iconWrapper: {
    width: 38,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2
  },
  iconWrapperActive: {
    backgroundColor: colors.primaryLight
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: typography.weights.medium,
    color: colors.textMuted,
    letterSpacing: 0.2
  },
  activeLabel: {
    color: colors.primary,
    fontWeight: typography.weights.bold
  }
});
