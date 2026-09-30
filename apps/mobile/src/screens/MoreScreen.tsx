import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { colors, ThemeTone } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { IconBox } from "../components/IconBox";
import { AuthUser, UnitSummary } from "@apartment/shared";

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

interface MoreScreenProps {
  currentUser?: AuthUser | null;
  currentUnit?: UnitSummary | null;
  onLogout?: () => void;
}

export function MoreScreen({ currentUser, currentUnit, onLogout }: MoreScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Resident Profile Card */}
      {currentUser && (
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : "R"}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{currentUser.fullName}</Text>
            <Text style={styles.profileEmail}>{currentUser.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {currentUnit ? `${currentUnit.block} - ${currentUnit.unitNumber}` : "Tower A - 402"} • {currentUser.role}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Logout Action Button */}
      {onLogout && (
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={onLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Sign Out of My Account</Text>
        </TouchableOpacity>
      )}

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
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgSurface,
    borderRadius: spacing.radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3b82f620",
    borderWidth: 1,
    borderColor: "#3b82f650",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3b82f6"
  },
  profileInfo: {
    flex: 1
  },
  profileName: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.textMain
  },
  profileEmail: {
    fontSize: typography.sizes.caption,
    color: colors.textMuted,
    marginTop: 1
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#10b98120",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4
  },
  roleText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#10b981"
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef444415",
    borderWidth: 1,
    borderColor: "#ef444440",
    borderRadius: spacing.radius.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.lg
  },
  logoutIcon: {
    fontSize: 16,
    marginRight: spacing.sm
  },
  logoutText: {
    color: "#ef4444",
    fontWeight: "700",
    fontSize: 14
  },
  header: {
    marginBottom: spacing.md
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
