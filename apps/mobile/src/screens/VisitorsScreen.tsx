import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { StatusPill } from "../components/StatusPill";
import { IconBox } from "../components/IconBox";

interface VisitorRecord {
  name: string;
  purpose: string;
  unit: string;
  entryTime: string;
  status: "Inside" | "Exited";
  symbol: string;
}

const recentVisitors: VisitorRecord[] = [
  { name: "Amazon Delivery", purpose: "Courier Delivery", unit: "Unit A-302", entryTime: "7:42 PM", status: "Inside", symbol: "📦" },
  { name: "Rajesh Kumar", purpose: "Personal Guest", unit: "Unit C-1102", entryTime: "7:18 PM", status: "Inside", symbol: "👤" },
  { name: "Urban Company", purpose: "Home Service", unit: "Unit B-804", entryTime: "6:55 PM", status: "Exited", symbol: "🛠️" },
  { name: "Swiggy Delivery", purpose: "Food Delivery", unit: "Unit D-406", entryTime: "6:21 PM", status: "Exited", symbol: "🛵" }
];

export function VisitorsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Gate Live Monitor Banner */}
      <View style={styles.gateBanner}>
        <View style={styles.gateLiveTag}>
          <View style={styles.livePulseDot} />
          <Text style={styles.gateLiveText}>GATE 1 LIVE</Text>
        </View>
        <Text style={styles.gateTitle}>12 Visitors on Premises</Text>
        <Text style={styles.gateSubtitle}>Gate 1 & Gate 2 active • 2 guards on duty</Text>

        <View style={styles.countersRow}>
          <View style={styles.counterBox}>
            <Text style={styles.counterNum}>46</Text>
            <Text style={styles.counterLabel}>Entries Today</Text>
          </View>
          <View style={styles.counterDivider} />
          <View style={styles.counterBox}>
            <Text style={styles.counterNum}>38</Text>
            <Text style={styles.counterLabel}>Exited</Text>
          </View>
          <View style={styles.counterDivider} />
          <View style={styles.counterBox}>
            <Text style={[styles.counterNum, { color: colors.primary }]}>8</Text>
            <Text style={styles.counterLabel}>Expected</Text>
          </View>
        </View>
      </View>

      {/* Action Header */}
      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Today's Visitor Log</Text>
        <TouchableOpacity style={styles.preApproveBtn} activeOpacity={0.8}>
          <Text style={styles.preApproveText}>+ Pre-approve</Text>
        </TouchableOpacity>
      </View>

      {/* Visitor Register Cards */}
      <View style={styles.visitorList}>
        {recentVisitors.map((visitor, index) => (
          <View
            key={visitor.name}
            style={[
              styles.visitorRow,
              index === recentVisitors.length - 1 && { borderBottomWidth: 0 }
            ]}
          >
            <IconBox
              symbol={visitor.symbol}
              tone={visitor.status === "Inside" ? "blue" : "green"}
              size={40}
            />

            <View style={styles.visitorDetails}>
              <Text style={styles.visitorName}>{visitor.name}</Text>
              <Text style={styles.visitorPurpose}>{visitor.purpose} • {visitor.unit}</Text>
              <Text style={styles.visitorTime}>Entry: {visitor.entryTime}</Text>
            </View>

            <StatusPill
              label={visitor.status}
              tone={visitor.status === "Inside" ? "blue" : "green"}
            />
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
  gateBanner: {
    backgroundColor: colors.bgSurface,
    borderRadius: spacing.radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
    elevation: 1
  },
  gateLiveTag: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: spacing.radius.sm,
    marginBottom: spacing.xs
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 6
  },
  gateLiveText: {
    fontSize: typography.sizes.tiny,
    fontWeight: typography.weights.bold,
    color: colors.success,
    letterSpacing: 0.5
  },
  gateTitle: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.heavy,
    color: colors.textMain
  },
  gateSubtitle: {
    fontSize: typography.sizes.caption,
    color: colors.textMuted,
    marginTop: 2
  },
  countersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  counterBox: {
    flex: 1,
    alignItems: "center"
  },
  counterDivider: {
    width: 1,
    backgroundColor: colors.border,
    height: "80%",
    alignSelf: "center"
  },
  counterNum: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.bold,
    color: colors.textMain
  },
  counterLabel: {
    fontSize: typography.sizes.tiny,
    color: colors.textMuted,
    marginTop: 1
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm
  },
  sectionTitle: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.bold,
    color: colors.textMain
  },
  preApproveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.radius.sm
  },
  preApproveText: {
    color: "#ffffff",
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.bold
  },
  visitorList: {
    backgroundColor: colors.bgSurface,
    borderRadius: spacing.radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden"
  },
  visitorRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  visitorDetails: {
    flex: 1,
    marginHorizontal: spacing.sm
  },
  visitorName: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.textMain
  },
  visitorPurpose: {
    fontSize: typography.sizes.caption,
    color: colors.textMuted,
    marginTop: 1
  },
  visitorTime: {
    fontSize: typography.sizes.tiny,
    color: colors.textMuted,
    marginTop: 2
  }
});
