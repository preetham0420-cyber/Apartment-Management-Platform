import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { StatusPill } from "../components/StatusPill";
import { IconBox } from "../components/IconBox";
import { UnitSummary } from "@apartment/shared";
import { mobileApiClient } from "../services/api-client";
import {
  BellIcon,
  ChevronRightIcon,
  ClockIcon
} from "../components/MobileIcons";

interface HomeScreenProps {
  currentUnit?: UnitSummary | null;
  onNavigateTab: (tab: "services" | "chat" | "visitors" | "more") => void;
}

export function HomeScreen({ currentUnit, onNavigateTab }: HomeScreenProps) {
  const [homeData, setHomeData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchHomeData = async () => {
    try {
      const data = await mobileApiClient.getResidentHome();
      setHomeData(data);
    } catch {
      // Fallback gracefully
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHomeData();
  };

  const activeNotice = homeData?.notices?.[0];
  const unit = homeData?.unit || currentUnit;
  const unitNumber = unit ? unit.unitNumber : "101";
  const unitFloor = unit?.floor || (unitNumber ? Math.floor(parseInt(unitNumber, 10) / 100) : 1);
  const unitBlock = unit?.block || "Tower A";
  const residentName = homeData?.resident?.fullName || "Ananya Sharma";

  const currentDueFormatted =
    homeData?.metrics?.currentDue !== undefined
      ? `₹${homeData.metrics.currentDue.toLocaleString()}`
      : "₹4,850";
  const openRequests = homeData?.metrics?.openRequestsCount ?? 1;
  const expectedGuests = homeData?.metrics?.expectedGuestsCount ?? 2;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
        />
      }
    >
      {/* Top Greeting Header */}
      <View style={styles.greetingRow}>
        <View>
          <Text style={styles.greetingSub}>WELCOME HOME</Text>
          <Text style={styles.greetingTitle}>Good morning, {residentName.split(" ")[0]}</Text>
          <Text style={styles.greetingUnit}>
            {unitBlock} • Unit {unitNumber}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => onNavigateTab("more")}
          activeOpacity={0.8}
        >
          <Text style={styles.avatarText}>
            {residentName.charAt(0).toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Compact Community Announcement Card */}
      {activeNotice ? (
        <View style={styles.announcementCard}>
          <View style={styles.announcementIconBox}>
            <BellIcon size={18} color={colors.primary} />
          </View>
          <View style={styles.announcementContent}>
            <View style={styles.announcementTop}>
              <Text style={styles.announcementTag}>COMMUNITY NOTICE</Text>
              <Text style={styles.announcementTime}>Official</Text>
            </View>
            <Text style={styles.announcementTitle} numberOfLines={1}>
              {activeNotice.title}
            </Text>
            <Text style={styles.announcementBody} numberOfLines={2}>
              {activeNotice.content}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.announcementCard}>
          <View style={styles.announcementIconBox}>
            <BellIcon size={18} color={colors.primary} />
          </View>
          <View style={styles.announcementContent}>
            <View style={styles.announcementTop}>
              <Text style={styles.announcementTag}>SOCIETY UPDATE</Text>
              <Text style={styles.announcementTime}>Today</Text>
            </View>
            <Text style={styles.announcementTitle}>Scheduled Power Backup Drill</Text>
            <Text style={styles.announcementBody}>
              Routine maintenance between 10:00 AM - 12:00 PM this Saturday. Elevators will operate on DG.
            </Text>
          </View>
        </View>
      )}

      {/* Polished Resident Unit Summary Card */}
      <View style={styles.unitSummaryCard}>
        <View style={styles.unitSummaryHeader}>
          <View>
            <Text style={styles.unitSummaryLabel}>RESIDENTIAL UNIT</Text>
            <Text style={styles.unitSummaryFlat}>Unit {unitNumber}</Text>
            <Text style={styles.unitSummaryMeta}>
              {unitBlock} • Floor {unitFloor || 1}
            </Text>
          </View>
          <View style={styles.verifiedBadge}>
            <View style={styles.verifiedDot} />
            <Text style={styles.verifiedText}>Verified Tenant</Text>
          </View>
        </View>

        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>MAINTENANCE DUE</Text>
            <Text style={styles.metricValue}>{currentDueFormatted}</Text>
            <Text style={styles.metricSub}>Due by 15th</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>OPEN REQUESTS</Text>
            <Text style={[styles.metricValue, { color: colors.warning }]}>
              {openRequests} Active
            </Text>
            <Text style={styles.metricSub}>Service Desk</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>EXPECTED GUESTS</Text>
            <Text style={[styles.metricValue, { color: colors.primary }]}>
              {expectedGuests} Today
            </Text>
            <Text style={styles.metricSub}>Gate Passes</Text>
          </View>
        </View>
      </View>

      {/* 6 Quick Resident Actions in Responsive Grid */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeading}>Quick Resident Operations</Text>
        <Text style={styles.sectionSubtitle}>Tap for direct access</Text>
      </View>

      <View style={styles.quickGrid}>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => onNavigateTab("visitors")}
          activeOpacity={0.7}
        >
          <IconBox symbol="shield" tone="emerald" size={44} />
          <Text style={styles.quickTitle}>Add Visitor</Text>
          <Text style={styles.quickDesc}>Gate Pass</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => onNavigateTab("services")}
          activeOpacity={0.7}
        >
          <IconBox symbol="wrench" tone="orange" size={44} />
          <Text style={styles.quickTitle}>Maintenance</Text>
          <Text style={styles.quickDesc}>Help Desk</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => onNavigateTab("chat")}
          activeOpacity={0.7}
        >
          <IconBox symbol="chat" tone="teal" size={44} />
          <Text style={styles.quickTitle}>Helpdesk</Text>
          <Text style={styles.quickDesc}>Direct Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => onNavigateTab("more")}
          activeOpacity={0.7}
        >
          <IconBox symbol="calendar" tone="emerald" size={44} />
          <Text style={styles.quickTitle}>Amenities</Text>
          <Text style={styles.quickDesc}>Book Slots</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => onNavigateTab("more")}
          activeOpacity={0.7}
        >
          <IconBox symbol="card" tone="teal" size={44} />
          <Text style={styles.quickTitle}>Payments</Text>
          <Text style={styles.quickDesc}>Dues & Bills</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => onNavigateTab("more")}
          activeOpacity={0.7}
        >
          <IconBox symbol="bell" tone="orange" size={44} />
          <Text style={styles.quickTitle}>Notices</Text>
          <Text style={styles.quickDesc}>Circulars</Text>
        </TouchableOpacity>
      </View>

      {/* Modern Community Activity Feed */}
      <View style={styles.activityHeader}>
        <View>
          <Text style={styles.sectionHeading}>Community Activity</Text>
          <Text style={styles.sectionSubtitle}>Recent operations in your society</Text>
        </View>
        <TouchableOpacity onPress={() => onNavigateTab("more")} activeOpacity={0.7}>
          <Text style={styles.viewAllLink}>View All &rarr;</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.activityFeed}>
        <View style={styles.activityItem}>
          <IconBox symbol="water" tone="orange" size={40} />
          <View style={styles.activityDetails}>
            <View style={styles.activityTop}>
              <Text style={styles.activityTitle}>Water Leak Reported</Text>
              <Text style={styles.activityTime}>10 min ago</Text>
            </View>
            <Text style={styles.activityContext}>B-804 • Plumbing</Text>
            <Text style={styles.activitySub}>Assigned to Ravi Plumbing</Text>
          </View>
          <StatusPill label="Assigned" tone="orange" />
        </View>

        <View style={styles.activityDivider} />

        <View style={styles.activityItem}>
          <IconBox symbol="package" tone="teal" size={40} />
          <View style={styles.activityDetails}>
            <View style={styles.activityTop}>
              <Text style={styles.activityTitle}>Visitor Entry Approved</Text>
              <Text style={styles.activityTime}>25 min ago</Text>
            </View>
            <Text style={styles.activityContext}>Tower A • Unit 302</Text>
            <Text style={styles.activitySub}>Amazon Delivery Agent verified at Gate 1</Text>
          </View>
          <StatusPill label="At Gate" tone="teal" />
        </View>

        <View style={styles.activityDivider} />

        <View style={styles.activityItem}>
          <IconBox symbol="card" tone="green" size={40} />
          <View style={styles.activityDetails}>
            <View style={styles.activityTop}>
              <Text style={styles.activityTitle}>Maintenance Receipt</Text>
              <Text style={styles.activityTime}>2h ago</Text>
            </View>
            <Text style={styles.activityContext}>C-1102 • Society Maintenance</Text>
            <Text style={styles.activitySub}>₹5,400 received via UPI</Text>
          </View>
          <StatusPill label="Paid" tone="green" />
        </View>

        <View style={styles.activityDivider} />

        <View style={styles.activityItem}>
          <IconBox symbol="shield" tone="red" size={40} />
          <View style={styles.activityDetails}>
            <View style={styles.activityTop}>
              <Text style={styles.activityTitle}>Security Inspection</Text>
              <Text style={styles.activityTime}>Today</Text>
            </View>
            <Text style={styles.activityContext}>Basement B2 • Parking Lot</Text>
            <Text style={styles.activitySub}>CCTV surveillance maintenance complete</Text>
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
    paddingBottom: 40,
    backgroundColor: colors.bgPage
  },
  greetingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    paddingHorizontal: 2
  },
  greetingSub: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: 0.8,
    marginBottom: 2
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: typography.weights.heavy,
    color: colors.textMain,
    letterSpacing: -0.4
  },
  greetingUnit: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: typography.weights.bold
  },
  announcementCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4
  },
  announcementIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#E8F4EF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },
  announcementContent: {
    flex: 1
  },
  announcementTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2
  },
  announcementTag: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: 0.5
  },
  announcementTime: {
    fontSize: 10,
    color: colors.textMuted
  },
  announcementTitle: {
    fontSize: 13,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
    marginBottom: 2
  },
  announcementBody: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16
  },
  unitSummaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6
  },
  unitSummaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
    marginBottom: 14
  },
  unitSummaryLabel: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 0.6
  },
  unitSummaryFlat: {
    fontSize: 24,
    fontWeight: typography.weights.heavy,
    color: colors.textMain,
    letterSpacing: -0.3,
    marginTop: 1
  },
  unitSummaryMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F4EF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(21, 154, 114, 0.2)"
  },
  verifiedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 6
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.primary
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  metricItem: {
    flex: 1,
    alignItems: "center"
  },
  metricDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 0.5
  },
  metricValue: {
    fontSize: 16,
    fontWeight: typography.weights.heavy,
    color: colors.textMain,
    marginTop: 2
  },
  metricSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1
  },
  sectionHeaderRow: {
    marginBottom: spacing.sm,
    paddingHorizontal: 2
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
    letterSpacing: -0.2
  },
  sectionSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: spacing.lg
  },
  quickCard: {
    width: "31%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3
  },
  quickTitle: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
    marginTop: 8,
    textAlign: "center"
  },
  quickDesc: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
    textAlign: "center"
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: spacing.sm,
    paddingHorizontal: 2
  },
  viewAllLink: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: typography.weights.semibold
  },
  activityFeed: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14
  },
  activityDivider: {
    height: 1,
    backgroundColor: "#F7F8F6",
    marginHorizontal: 14
  },
  activityDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8
  },
  activityTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: typography.weights.bold,
    color: colors.textMain
  },
  activityTime: {
    fontSize: 10,
    color: colors.textMuted
  },
  activityContext: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1
  },
  activitySub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1
  }
});
