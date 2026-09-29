import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { colors, ThemeTone } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { IconBox } from "../components/IconBox";

interface ModuleGridItem {
  id: string;
  title: string;
  subtitle: string;
  symbol: string;
  tone: ThemeTone;
}

const allModules: ModuleGridItem[] = [
  { id: "residents", title: "Residents & Homes", subtitle: "248 Units • 648 Residents", symbol: "👥", tone: "blue" },
  { id: "rentals", title: "Rental Management", subtitle: "87 Active Leases", symbol: "📋", tone: "violet" },
  { id: "maintenance", title: "Maintenance", subtitle: "18 Open Requests", symbol: "🔧", tone: "orange" },
  { id: "payments", title: "Payments & Accounts", subtitle: "₹18.4L Collected", symbol: "💳", tone: "green" },
  { id: "visitors", title: "Visitors & Gate", subtitle: "12 Inside • Live Monitor", symbol: "🛡️", tone: "blue" },
  { id: "cctv", title: "CCTV & Security", subtitle: "33 / 36 Online", symbol: "📹", tone: "red" },
  { id: "amenities", title: "Amenities", subtitle: "Hall, Courts, Pool", symbol: "🏊", tone: "blue" },
  { id: "chat", title: "Chat & Messages", subtitle: "Helpdesk & Broadcast", symbol: "💬", tone: "violet" },
  { id: "notices", title: "Notices & Meetings", subtitle: "7 Active Circulars", symbol: "📢", tone: "orange" },
  { id: "staff", title: "Staff & Vendors", subtitle: "34 on Duty • 42 Partners", symbol: "👷", tone: "green" },
  { id: "documents", title: "Documents", subtitle: "Bylaws, AMCs, Policies", symbol: "📁", tone: "blue" },
  { id: "reports", title: "Reports & Insights", subtitle: "Collections & Audits", symbol: "📊", tone: "violet" }
];

export function MoreScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.pageHeading}>Community Services</Text>
        <Text style={styles.pageSubheading}>All 12 community management modules</Text>
      </View>

      <View style={styles.grid}>
        {allModules.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.moduleCard}
            activeOpacity={0.7}
          >
            <IconBox symbol={item.symbol} tone={item.tone} size={42} />
            <Text style={styles.moduleTitle}>{item.title}</Text>
            <Text style={styles.moduleSubtitle}>{item.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl
  },
  header: {
    marginBottom: spacing.lg
  },
  pageHeading: {
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.heavy,
    color: colors.textMain
  },
  pageSubheading: {
    fontSize: typography.sizes.caption,
    color: colors.textMuted,
    marginTop: 2
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  moduleCard: {
    width: "48%",
    backgroundColor: colors.bgSurface,
    borderRadius: spacing.radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  moduleTitle: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
    marginTop: spacing.sm,
    textAlign: "center"
  },
  moduleSubtitle: {
    fontSize: typography.sizes.tiny,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: "center"
  }
});
