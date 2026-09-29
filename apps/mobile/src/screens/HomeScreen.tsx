import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { StatusPill } from "../components/StatusPill";
import { IconBox } from "../components/IconBox";
import { NoticeBanner } from "../components/NoticeBanner";
import { ROLE_MODEL_STATUS } from "@apartment/shared";

interface HomeScreenProps {
  onNavigateTab: (tab: "services" | "chat" | "visitors" | "more") => void;
}

export function HomeScreen({ onNavigateTab }: HomeScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Notice Banner */}
      <NoticeBanner
        title="Day 2 Native Mobile Shell"
        message={`${ROLE_MODEL_STATUS.statusNotes} Displaying native UI components without WebView.`}
      />

      {/* Resident Unit Summary Card */}
      <View style={styles.unitCard}>
        <View style={styles.unitHeader}>
          <View>
            <Text style={styles.unitFlat}>Unit B-804</Text>
            <Text style={styles.unitMeta}>Tower B • 8th Floor • 3 Residents</Text>
          </View>
          <StatusPill label="Verified" tone="green" />
        </View>

        <View style={styles.unitStatsRow}>
          <View style={styles.unitStat}>
            <Text style={styles.statLabel}>Current Due</Text>
            <Text style={styles.statValue}>₹4,850</Text>
            <Text style={styles.statNote}>Due by 10th</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.unitStat}>
            <Text style={styles.statLabel}>Open Requests</Text>
            <Text style={[styles.statValue, { color: colors.warning }]}>1 Active</Text>
            <Text style={styles.statNote}>Plumbing</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.unitStat}>
            <Text style={styles.statLabel}>Expected Today</Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>2 Guests</Text>
            <Text style={styles.statNote}>Gate Passes</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions Grid */}
      <Text style={styles.sectionTitle}>Quick Resident Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => onNavigateTab("visitors")}
          activeOpacity={0.7}
        >
          <IconBox symbol="🛡️" tone="blue" size={40} />
          <Text style={styles.actionTitle}>Add Visitor</Text>
          <Text style={styles.actionSub}>Gate Pass</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => onNavigateTab("services")}
          activeOpacity={0.7}
        >
          <IconBox symbol="🔧" tone="orange" size={40} />
          <Text style={styles.actionTitle}>New Request</Text>
          <Text style={styles.actionSub}>Service Desk</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => onNavigateTab("chat")}
          activeOpacity={0.7}
        >
          <IconBox symbol="💬" tone="violet" size={40} />
          <Text style={styles.actionTitle}>Helpdesk</Text>
          <Text style={styles.actionSub}>Direct Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => onNavigateTab("more")}
          activeOpacity={0.7}
        >
          <IconBox symbol="📑" tone="green" size={40} />
          <Text style={styles.actionTitle}>All Modules</Text>
          <Text style={styles.actionSub}>12 Services</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity List */}
      <View style={styles.activityHeader}>
        <Text style={styles.sectionTitle}>Recent Community Activity</Text>
        <TouchableOpacity onPress={() => onNavigateTab("more")}>
          <Text style={styles.seeAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.activityList}>
        <View style={styles.activityRow}>
          <IconBox symbol="💧" tone="orange" size={36} />
          <View style={styles.activityBody}>
            <Text style={styles.activityTitle}>Water Leak Reported</Text>
            <Text style={styles.activityDetail}>B-804 • Plumbing assigned to Ravi Plumbing</Text>
          </View>
          <StatusPill label="Assigned" tone="orange" />
        </View>

        <View style={styles.activityRow}>
          <IconBox symbol="📦" tone="blue" size={36} />
          <View style={styles.activityBody}>
            <Text style={styles.activityTitle}>Visitor Approved</Text>
            <Text style={styles.activityDetail}>Amazon Delivery • Unit A-302</Text>
          </View>
          <StatusPill label="At Gate" tone="blue" />
        </View>

        <View style={styles.activityRow}>
          <IconBox symbol="💳" tone="green" size={36} />
          <View style={styles.activityBody}>
            <Text style={styles.activityTitle}>Maintenance Receipt</Text>
            <Text style={styles.activityDetail}>C-1102 • ₹5,400 received</Text>
          </View>
          <StatusPill label="Paid" tone="green" />
        </View>

        <View style={[styles.activityRow, { borderBottomWidth: 0 }]}>
          <IconBox symbol="📹" tone="red" size={36} />
          <View style={styles.activityBody}>
            <Text style={styles.activityTitle}>Security Notice</Text>
            <Text style={styles.activityDetail}>CAM-28 Basement B2 service scheduled</Text>
          </View>
          <StatusPill label="Attention" tone="red" />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl
  },
  unitCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: spacing.radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  unitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
    marginBottom: spacing.sm
  },
  unitFlat: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.heavy,
    color: colors.textMain
  },
  unitMeta: {
    fontSize: typography.sizes.caption,
    color: colors.textMuted,
    marginTop: 2
  },
  unitStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: spacing.xs
  },
  unitStat: {
    flex: 1,
    alignItems: "center"
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    height: "80%",
    alignSelf: "center"
  },
  statLabel: {
    fontSize: typography.sizes.tiny,
    color: colors.textMuted,
    textTransform: "uppercase",
    fontWeight: typography.weights.semibold
  },
  statValue: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
    marginTop: 2
  },
  statNote: {
    fontSize: typography.sizes.tiny,
    color: colors.textMuted,
    marginTop: 1
  },
  sectionTitle: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
    marginBottom: spacing.sm
  },
  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg
  },
  actionCard: {
    width: "23%",
    backgroundColor: colors.bgSurface,
    borderRadius: spacing.radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: "center",
    elevation: 1
  },
  actionTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
    marginTop: spacing.xs,
    textAlign: "center"
  },
  actionSub: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 1
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs
  },
  seeAllText: {
    fontSize: typography.sizes.caption,
    color: colors.primary,
    fontWeight: typography.weights.semibold
  },
  activityList: {
    backgroundColor: colors.bgSurface,
    borderRadius: spacing.radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden"
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  activityBody: {
    flex: 1,
    marginHorizontal: spacing.sm
  },
  activityTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semibold,
    color: colors.textMain
  },
  activityDetail: {
    fontSize: typography.sizes.caption,
    color: colors.textMuted,
    marginTop: 2
  }
});
