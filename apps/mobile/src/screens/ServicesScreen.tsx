import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { StatusPill } from "../components/StatusPill";
import { IconBox } from "../components/IconBox";

interface TicketItem {
  id: string;
  title: string;
  location: string;
  category: string;
  priority: "Urgent" | "Normal" | "High";
  status: "Assigned" | "In Progress" | "New";
  assignee: string;
  accentColor: string;
}

const sampleTickets: TicketItem[] = [
  {
    id: "MR-1048",
    title: "Water leakage under kitchen sink",
    location: "Unit B-804 • Plumbing",
    category: "Plumbing",
    priority: "Urgent",
    status: "Assigned",
    assignee: "Ravi Plumbing Services",
    accentColor: colors.danger
  },
  {
    id: "MR-1047",
    title: "Corridor light flickering",
    location: "Block C • Floor 7",
    category: "Electrical",
    priority: "Normal",
    status: "In Progress",
    assignee: "Kumar Electricals",
    accentColor: colors.warning
  },
  {
    id: "MR-1046",
    title: "Bedroom window latch broken",
    location: "Unit A-302 • Carpentry",
    category: "Carpentry",
    priority: "Normal",
    status: "New",
    assignee: "Unassigned",
    accentColor: colors.primary
  }
];

const trustedVendors = [
  { name: "Ravi Plumbing Services", trade: "Plumber", rating: "4.8", phone: "+91 98450 11882", tone: "blue" as const },
  { name: "Kumar Electricals", trade: "Electrician", rating: "4.7", phone: "+91 99012 73048", tone: "orange" as const },
  { name: "SecureVision Systems", trade: "CCTV & Security", rating: "4.9", phone: "+91 98863 20114", tone: "violet" as const },
  { name: "CleanNest Facility", trade: "Housekeeping", rating: "4.6", phone: "+91 97415 66829", tone: "green" as const }
];

export function ServicesScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header CTA */}
      <View style={styles.actionHeader}>
        <View>
          <Text style={styles.pageHeading}>Maintenance Desk</Text>
          <Text style={styles.pageSubheading}>Track requests and verified vendors</Text>
        </View>
        <TouchableOpacity style={styles.createButton} activeOpacity={0.8}>
          <Text style={styles.createButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Tickets List */}
      <Text style={styles.sectionTitle}>Active Service Requests</Text>
      {sampleTickets.map((ticket) => (
        <View key={ticket.id} style={styles.ticketCard}>
          <View style={[styles.priorityLine, { backgroundColor: ticket.accentColor }]} />
          <View style={styles.ticketContent}>
            <View style={styles.ticketTopRow}>
              <Text style={styles.ticketId}>{ticket.id} • {ticket.category.toUpperCase()}</Text>
              <StatusPill label={ticket.status} />
            </View>
            <Text style={styles.ticketTitle}>{ticket.title}</Text>
            <Text style={styles.ticketLocation}>{ticket.location}</Text>

            <View style={styles.assigneeRow}>
              <Text style={styles.assigneeLabel}>Assigned to:</Text>
              <Text style={styles.assigneeName}>{ticket.assignee}</Text>
            </View>
          </View>
        </View>
      ))}

      {/* Trusted Vendor Directory */}
      <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>Trusted Service Directory</Text>
      <View style={styles.vendorList}>
        {trustedVendors.map((vendor, index) => (
          <View
            key={vendor.name}
            style={[
              styles.vendorRow,
              index === trustedVendors.length - 1 && { borderBottomWidth: 0 }
            ]}
          >
            <IconBox symbol="⭐" tone={vendor.tone} size={36} />
            <View style={styles.vendorInfo}>
              <Text style={styles.vendorName}>{vendor.name}</Text>
              <Text style={styles.vendorTrade}>{vendor.trade} • ★ {vendor.rating}</Text>
              <Text style={styles.vendorPhone}>{vendor.phone}</Text>
            </View>
            <TouchableOpacity style={styles.callBadge} activeOpacity={0.7}>
              <Text style={styles.callIcon}>📞</Text>
            </TouchableOpacity>
          </View>
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
  actionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.radius.sm
  },
  createButtonText: {
    color: "#ffffff",
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.caption
  },
  sectionTitle: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
    marginBottom: spacing.sm
  },
  ticketCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: spacing.radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    flexDirection: "row",
    overflow: "hidden",
    elevation: 1
  },
  priorityLine: {
    width: 5
  },
  ticketContent: {
    flex: 1,
    padding: spacing.md
  },
  ticketTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs
  },
  ticketId: {
    fontSize: typography.sizes.tiny,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 0.5
  },
  ticketTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
    marginBottom: 2
  },
  ticketLocation: {
    fontSize: typography.sizes.caption,
    color: colors.textMuted
  },
  assigneeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  assigneeLabel: {
    fontSize: typography.sizes.tiny,
    color: colors.textMuted,
    marginRight: 6
  },
  assigneeName: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.semibold,
    color: colors.textMain
  },
  vendorList: {
    backgroundColor: colors.bgSurface,
    borderRadius: spacing.radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden"
  },
  vendorRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  vendorInfo: {
    flex: 1,
    marginLeft: spacing.sm
  },
  vendorName: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.textMain
  },
  vendorTrade: {
    fontSize: typography.sizes.caption,
    color: colors.textMuted,
    marginTop: 1
  },
  vendorPhone: {
    fontSize: typography.sizes.caption,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
    marginTop: 2
  },
  callBadge: {
    width: 36,
    height: 36,
    borderRadius: spacing.radius.round,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center"
  },
  callIcon: {
    fontSize: 16
  }
});
