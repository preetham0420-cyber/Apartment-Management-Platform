import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl
} from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { StatusPill } from "../components/StatusPill";
import { IconBox } from "../components/IconBox";
import { mobileApiClient } from "../services/api-client";
import { Visitor } from "@apartment/shared";

export function VisitorsScreen() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form State
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [purpose, setPurpose] = useState("GUEST");
  const [formError, setFormError] = useState<string | null>(null);

  const fetchVisitors = async () => {
    try {
      const data = await mobileApiClient.getVisitors();
      setVisitors(data);
    } catch (err: any) {
      // Graceful error display
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchVisitors();
  };

  const handleCreateVisitor = async () => {
    if (!visitorName.trim()) {
      setFormError("Visitor name is required.");
      return;
    }
    if (!visitorPhone.trim() || visitorPhone.length < 5) {
      setFormError("Valid phone number is required.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const arrival = new Date(Date.now() + 2 * 3600 * 1000).toISOString();
      const newVisitor = await mobileApiClient.createVisitor({
        visitorName: visitorName.trim(),
        visitorPhone: visitorPhone.trim(),
        purpose,
        expectedArrival: arrival
      });

      setVisitors([newVisitor, ...visitors]);
      setModalVisible(false);
      setVisitorName("");
      setVisitorPhone("");
      setPurpose("GUEST");
      Alert.alert("Visitor Pass Created", `Access Code: ${newVisitor.accessCode}`);
    } catch (err: any) {
      setFormError(err.message || "Failed to create visitor pass.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (visitorId: string, newStatus: string) => {
    try {
      const updated = await mobileApiClient.updateVisitorStatus(visitorId, newStatus);
      setVisitors((prev) => prev.map((v) => (v.id === visitorId ? updated : v)));
    } catch (err: any) {
      Alert.alert("Update Failed", err.message || "Could not update status.");
    }
  };

  const getPurposeSymbol = (pur: string) => {
    switch (pur?.toUpperCase()) {
      case "DELIVERY":
        return "📦";
      case "CAB":
        return "🚕";
      case "SERVICE":
        return "🛠️";
      case "GUEST":
      default:
        return "👤";
    }
  };

  const getStatusTone = (status: string): "blue" | "green" | "orange" | "red" => {
    switch (status) {
      case "CHECKED_IN":
        return "green";
      case "AT_GATE":
        return "orange";
      case "REJECTED":
        return "red";
      case "PRE_APPROVED":
      default:
        return "blue";
    }
  };

  const insideCount = visitors.filter((v) => v.status === "CHECKED_IN").length;
  const expectedCount = visitors.filter((v) => v.status === "PRE_APPROVED" || v.status === "AT_GATE").length;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Gate Live Monitor Banner */}
        <View style={styles.gateBanner}>
          <View style={styles.gateLiveTag}>
            <View style={styles.livePulseDot} />
            <Text style={styles.gateLiveText}>GATE 1 LIVE</Text>
          </View>
          <Text style={styles.gateTitle}>{insideCount} Visitors Inside Unit</Text>
          <Text style={styles.gateSubtitle}>Tower A Gate Pass Register • Security Verified</Text>

          <View style={styles.countersRow}>
            <View style={styles.counterBox}>
              <Text style={styles.counterNum}>{visitors.length}</Text>
              <Text style={styles.counterLabel}>Total Registered</Text>
            </View>
            <View style={styles.counterDivider} />
            <View style={styles.counterBox}>
              <Text style={[styles.counterNum, { color: colors.success }]}>{insideCount}</Text>
              <Text style={styles.counterLabel}>Checked In</Text>
            </View>
            <View style={styles.counterDivider} />
            <View style={styles.counterBox}>
              <Text style={[styles.counterNum, { color: colors.primary }]}>{expectedCount}</Text>
              <Text style={styles.counterLabel}>Expected</Text>
            </View>
          </View>
        </View>

        {/* Action Header */}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>My Visitor Passes</Text>
          <TouchableOpacity
            style={styles.preApproveBtn}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.preApproveText}>+ Add Visitor</Text>
          </TouchableOpacity>
        </View>

        {/* Visitor Register Cards */}
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
        ) : visitors.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No visitors registered yet.</Text>
            <Text style={styles.emptySubtext}>Tap "+ Add Visitor" to generate a digital gate pass.</Text>
          </View>
        ) : (
          <View style={styles.visitorList}>
            {visitors.map((visitor, index) => (
              <View
                key={visitor.id}
                style={[
                  styles.visitorRow,
                  index === visitors.length - 1 && { borderBottomWidth: 0 }
                ]}
              >
                <IconBox
                  symbol={getPurposeSymbol(visitor.purpose)}
                  tone={getStatusTone(visitor.status)}
                  size={42}
                />

                <View style={styles.visitorDetails}>
                  <Text style={styles.visitorName}>{visitor.visitorName}</Text>
                  <Text style={styles.visitorPurpose}>
                    {visitor.purpose} • {visitor.visitorPhone}
                  </Text>
                  <Text style={styles.visitorCode}>
                    Code: <Text style={{ fontWeight: "700", color: colors.primary }}>{visitor.accessCode}</Text>
                  </Text>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <StatusPill
                    label={visitor.status.replace("_", " ")}
                    tone={getStatusTone(visitor.status)}
                  />
                  {visitor.status === "AT_GATE" && (
                    <TouchableOpacity
                      style={styles.actionPillBtn}
                      onPress={() => handleUpdateStatus(visitor.id, "CHECKED_IN")}
                    >
                      <Text style={styles.actionPillText}>Approve</Text>
                    </TouchableOpacity>
                  )}
                  {visitor.status === "CHECKED_IN" && (
                    <TouchableOpacity
                      style={[styles.actionPillBtn, { backgroundColor: "#fef3c7" }]}
                      onPress={() => handleUpdateStatus(visitor.id, "CHECKED_OUT")}
                    >
                      <Text style={[styles.actionPillText, { color: "#92400e" }]}>Check Out</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Visitor Modal Form */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Generate Visitor Pass</Text>
            <Text style={styles.modalSubtitle}>Create instant digital gate pass for Tower A - 402</Text>

            {formError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            )}

            <Text style={styles.inputLabel}>Visitor Full Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Ramesh Kumar / Flipkart Agent"
              placeholderTextColor={colors.textMuted}
              value={visitorName}
              onChangeText={setVisitorName}
            />

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.textInput}
              placeholder="+91 98765 43210"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              value={visitorPhone}
              onChangeText={setVisitorPhone}
            />

            <Text style={styles.inputLabel}>Purpose of Visit</Text>
            <View style={styles.purposeRow}>
              {["GUEST", "DELIVERY", "CAB", "SERVICE"].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.purposeBtn, purpose === p && styles.purposeBtnActive]}
                  onPress={() => setPurpose(p)}
                >
                  <Text style={[styles.purposeBtnText, purpose === p && styles.purposeBtnTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
                disabled={submitting}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleCreateVisitor}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>Generate Pass</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl
  },
  gateBanner: {
    backgroundColor: colors.bgSurface,
    borderRadius: spacing.radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg
  },
  gateLiveTag: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    marginRight: 6
  },
  gateLiveText: {
    fontSize: typography.sizes.tiny,
    fontWeight: typography.weights.bold,
    color: colors.danger,
    letterSpacing: 0.8
  },
  gateTitle: {
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.heavy,
    color: colors.textMain
  },
  gateSubtitle: {
    fontSize: typography.sizes.caption,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.md
  },
  countersRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgPage,
    borderRadius: spacing.radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm
  },
  counterBox: {
    flex: 1,
    alignItems: "center"
  },
  counterNum: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.heavy,
    color: colors.textMain
  },
  counterLabel: {
    fontSize: typography.sizes.tiny,
    color: colors.textMuted,
    marginTop: 2
  },
  counterDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm
  },
  sectionTitle: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.bold,
    color: colors.textMain
  },
  preApproveBtn: {
    backgroundColor: colors.primary,
    borderRadius: spacing.radius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2
  },
  preApproveText: {
    color: "#fff",
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.bold
  },
  visitorList: {
    backgroundColor: colors.bgSurface,
    borderRadius: spacing.radius.lg,
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
    marginLeft: spacing.md
  },
  visitorName: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.textMain
  },
  visitorPurpose: {
    fontSize: typography.sizes.caption,
    color: colors.textMuted,
    marginTop: 2
  },
  visitorCode: {
    fontSize: typography.sizes.tiny,
    color: colors.textMuted,
    marginTop: 2
  },
  actionPillBtn: {
    backgroundColor: "#dbeafe",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6
  },
  actionPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary
  },
  emptyCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: spacing.radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: "center"
  },
  emptyText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.textMain
  },
  emptySubtext: {
    fontSize: typography.sizes.caption,
    color: colors.textMuted,
    marginTop: 4
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end"
  },
  modalContent: {
    backgroundColor: colors.bgSurface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.xl
  },
  modalTitle: {
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.heavy,
    color: colors.textMain
  },
  modalSubtitle: {
    fontSize: typography.sizes.caption,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.md
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    padding: 8,
    marginBottom: spacing.md
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 12,
    fontWeight: "600"
  },
  inputLabel: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
    marginBottom: 4,
    marginTop: 8
  },
  textInput: {
    backgroundColor: colors.bgPage,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textMain
  },
  purposeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: spacing.lg
  },
  purposeBtn: {
    flex: 1,
    backgroundColor: colors.bgPage,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingVertical: 8,
    marginHorizontal: 2,
    alignItems: "center"
  },
  purposeBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  purposeBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted
  },
  purposeBtnTextActive: {
    color: "#fff"
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: spacing.md
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8
  },
  cancelBtnText: {
    color: colors.textMuted,
    fontWeight: "600"
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  submitBtnText: {
    color: "#fff",
    fontWeight: "700"
  }
});
