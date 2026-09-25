import React from "react";
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { ROLE_MODEL_STATUS } from "@apartment/shared";
import { colors } from "./src/theme/colors";

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>RESIDENT APP</Text>
          </View>
          <Text style={styles.title}>Community Portal</Text>
          <Text style={styles.subtitle}>Day 1 Production Foundation (Native Expo)</Text>
        </View>

        {/* Provisional Role Notice Banner */}
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Provisional Role & Authorization Notice</Text>
          <Text style={styles.noticeBody}>
            {ROLE_MODEL_STATUS.statusNotes} No RBAC or authorization logic is active today.
          </Text>
        </View>

        {/* Architecture Verification Cards */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Target Architecture Confirmed</Text>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Mobile Engine:</Text>
            <Text style={styles.specValue}>React Native (No WebView)</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Tooling:</Text>
            <Text style={styles.specValue}>Expo (Expo Go Ready)</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Shared Types:</Text>
            <Text style={styles.specValue}>@apartment/shared connected</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Backend Target:</Text>
            <Text style={styles.specValue}>Express 5 / Node 22 API</Text>
          </View>
        </View>

        {/* Quick Action Preview */}
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <Text style={styles.actionButtonText}>My Unit</Text>
            <Text style={styles.actionSubtext}>View occupancy</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <Text style={styles.actionButtonText}>Gate Passes</Text>
            <Text style={styles.actionSubtext}>Pre-approve visitors</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <Text style={styles.actionButtonText}>Maintenance</Text>
            <Text style={styles.actionSubtext}>Raise ticket</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <Text style={styles.actionButtonText}>Notices</Text>
            <Text style={styles.actionSubtext}>Community feed</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            This native mobile app will be tested on physical devices via Expo Go.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgPage
  },
  container: {
    padding: 20
  },
  header: {
    marginBottom: 20
  },
  badgeContainer: {
    alignSelf: "flex-start",
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8
  },
  badgeText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.5
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.textMain
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4
  },
  noticeCard: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fef3c7",
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    borderRadius: 8,
    padding: 14,
    marginBottom: 20
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400e",
    marginBottom: 4
  },
  noticeBody: {
    fontSize: 12,
    color: "#78350f",
    lineHeight: 18
  },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textMain,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6
  },
  specLabel: {
    fontSize: 13,
    color: colors.textMuted
  },
  specValue: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMain
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20
  },
  actionButton: {
    width: "48%",
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textMain
  },
  actionSubtext: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4
  },
  footerNote: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center"
  }
});
