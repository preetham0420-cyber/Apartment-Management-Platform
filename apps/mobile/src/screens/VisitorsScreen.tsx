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
import {
  ShieldIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
  SearchIcon
} from "../components/MobileIcons";

export function VisitorsScreen() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [search, setSearch] = useState<string>("");
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
    } catch {
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
      setFormError("Visitor full name is required.");
      return;
    }
    if (!visitorPhone.trim() || visitorPhone.length < 5) {
      setFormError("Valid contact number is required.");
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
      Alert.alert(
        "Digital Pass Issued",
        `Access Code: ${newVisitor.accessCode}\nShare this with ${newVisitor.visitorName} for instant gate clearance.`
      );
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

  const getPurposeIcon = (pur: string) => {
    switch (pur?.toUpperCase()) {
      case "DELIVERY":
        return "package";
      case "CAB":
        return "car";
      case "SERVICE":
        return "wrench";
      case "GUEST":
      default:
        return "user";
    }
  };

  const getStatusTone = (status: string): "teal" | "green" | "orange" | "red" => {
    switch (status) {
      case "CHECKED_IN":
        return "green";
      case "AT_GATE":
        return "orange";
      case "REJECTED":
        return "red";
      case "PRE_APPROVED":
      default:
        return "teal";
    }
  };

  const insideCount = visitors.filter((v) => v.status === "CHECKED_IN").length;
  const expectedCount = visitors.filter(
    (v) => v.status === "PRE_APPROVED" || v.status === "AT_GATE"
  ).length;

  const filteredVisitors = visitors.filter((v) => {
    const q = search.toLowerCase();
    return (
      v.visitorName.toLowerCase().includes(q) ||
      v.visitorPhone.includes(q) ||
      v.accessCode.toLowerCase().includes(q) ||
      (v.purpose && v.purpose.toLowerCase().includes(q))
    );
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPage }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Gate Live Monitor Banner */}
        <View style={styles.gateBanner}>
          <View style={styles.gateLiveTag}>
            <View style={styles.livePulseDot} />
            <Text style={styles.gateLiveText}>PERIMETER ACCESS • GATE 1</Text>
          </View>
          <Text style={styles.gateTitle}>
            {insideCount === 1 ? "1 Guest Inside Unit" : `${insideCount} Guests Inside Unit`}
          </Text>
          <Text style={styles.gateSubtitle}>
            Pre-approved entry codes and digital visitor register
          </Text>

          <View style={styles.countersRow}>
            <View style={styles.counterBox}>
              <Text style={styles.counterNum}>{visitors.length}</Text>
              <Text style={styles.counterLabel}>Total Registered</Text>
            </View>
            <View style={styles.counterDivider} />
            <View style={styles.counterBox}>
              <Text style={[styles.counterNum, { color: colors.primary }]}>{insideCount}</Text>
              <Text style={styles.counterLabel}>Checked In</Text>
            </View>
            <View style={styles.counterDivider} />
            <View style={styles.counterBox}>
              <Text style={[styles.counterNum, { color: colors.warning }]}>{expectedCount}</Text>
              <Text style={styles.counterLabel}>Expected Today</Text>
            </View>
          </View>
        </View>

        {/* Action Header */}
        <View style={styles.listHeader}>
          <View>
            <Text style={styles.sectionTitle}>Gate Passes</Text>
            <Text style={styles.sectionSubtitle}>Active passes & arrival history</Text>
          </View>
          <TouchableOpacity
            style={styles.preApproveBtn}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <PlusIcon size={14} color="#ffffff" strokeWidth={2.5} />
            <Text style={styles.preApproveText}>Add Visitor</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar when visitors exist */}
        {visitors.length > 0 && (
          <View style={styles.searchBarContainer}>
            <SearchIcon size={16} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by visitor name, pass code, phone..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.clearSearchBtn}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Visitor Register Cards */}
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 24 }} />
        ) : visitors.length === 0 ? (
          <View style={styles.emptyCard}>
            <IconBox symbol="shield" tone="emerald" size={48} />
            <Text style={styles.emptyText}>No Active Visitor Passes</Text>
            <Text style={styles.emptySubtext}>
              Generate a digital OTP pass for deliveries, cab drivers, or guests.
            </Text>
            <TouchableOpacity
              style={styles.emptyCtaBtn}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyCtaText}>+ Pre-Approve Visitor</Text>
            </TouchableOpacity>
          </View>
        ) : filteredVisitors.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No matching visitors</Text>
            <Text style={styles.emptySubtext}>
              No visitors found matching "{search}".
            </Text>
          </View>
        ) : (
          <View style={styles.visitorList}>
            {filteredVisitors.map((visitor, index) => (
              <View
                key={visitor.id}
                style={[
                  styles.visitorRow,
                  index === visitors.length - 1 && { borderBottomWidth: 0 }
                ]}
              >
                <IconBox
                  symbol={getPurposeIcon(visitor.purpose)}
                  tone={getStatusTone(visitor.status)}
                  size={42}
                />

                <View style={styles.visitorDetails}>
                  <Text style={styles.visitorName}>{visitor.visitorName}</Text>
                  <Text style={styles.visitorPurpose}>
                    {visitor.purpose} • {visitor.visitorPhone}
                  </Text>
                  <View style={styles.codeBadge}>
                    <Text style={styles.codeBadgeLabel}>PASS CODE:</Text>
                    <Text style={styles.codeBadgeValue}>{visitor.accessCode}</Text>
                  </View>
                </View>

                <View style={styles.statusCol}>
                  <StatusPill
                    label={visitor.status.replace("_", " ")}
                    tone={getStatusTone(visitor.status)}
                  />
                  {visitor.status === "AT_GATE" && (
                    <TouchableOpacity
                      style={styles.actionPillBtn}
                      onPress={() => handleUpdateStatus(visitor.id, "CHECKED_IN")}
                    >
                      <Text style={styles.actionPillText}>Approve Entry</Text>
                    </TouchableOpacity>
                  )}
                  {visitor.status === "CHECKED_IN" && (
                    <TouchableOpacity
                      style={[styles.actionPillBtn, { backgroundColor: "#FEE2E2" }]}
                      onPress={() => handleUpdateStatus(visitor.id, "CHECKED_OUT")}
                    >
                      <Text style={[styles.actionPillText, { color: colors.danger }]}>
                        Check Out
                      </Text>
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
            <Text style={styles.modalTitle}>Issue Visitor Pass</Text>
            <Text style={styles.modalSubtitle}>
              Pre-authorizes digital clearance at society security gates
            </Text>

            {formError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            )}

            <Text style={styles.inputLabel}>VISITOR FULL NAME</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Ramesh Kumar / Flipkart Agent"
              placeholderTextColor={colors.textMuted}
              value={visitorName}
              onChangeText={setVisitorName}
            />

            <Text style={styles.inputLabel}>PHONE NUMBER</Text>
            <TextInput
              style={styles.textInput}
              placeholder="+91 98765 43210"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              value={visitorPhone}
              onChangeText={setVisitorPhone}
            />

            <Text style={styles.inputLabel}>PURPOSE OF VISIT</Text>
            <View style={styles.purposeRow}>
              {["GUEST", "DELIVERY", "CAB", "SERVICE"].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.purposeBtn, purpose === p && styles.purposeBtnActive]}
                  onPress={() => setPurpose(p)}
                >
                  <Text
                    style={[
                      styles.purposeBtnText,
                      purpose === p && styles.purposeBtnTextActive
                    ]}
                  >
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
    paddingBottom: 40
  },
  gateBanner: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6
  },
  gateLiveTag: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primary,
    marginRight: 6
  },
  gateLiveText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: 0.7
  },
  gateTitle: {
    fontSize: 22,
    fontWeight: typography.weights.heavy,
    color: colors.textMain,
    letterSpacing: -0.3
  },
  gateSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 14
  },
  countersRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F8F6",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8
  },
  counterBox: {
    flex: 1,
    alignItems: "center"
  },
  counterNum: {
    fontSize: 18,
    fontWeight: typography.weights.heavy,
    color: colors.textMain
  },
  counterLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1
  },
  counterDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 2
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: typography.weights.bold,
    color: colors.textMain
  },
  sectionSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1
  },
  preApproveBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4
  },
  preApproveText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: typography.weights.bold
  },
  visitorList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden"
  },
  visitorRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F7F8F6"
  },
  visitorDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8
  },
  visitorName: {
    fontSize: 14,
    fontWeight: typography.weights.bold,
    color: colors.textMain
  },
  visitorPurpose: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2
  },
  codeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F4EF",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
    gap: 4
  },
  codeBadgeLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.primary
  },
  codeBadgeValue: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 0.5
  },
  statusCol: {
    alignItems: "flex-end"
  },
  actionPillBtn: {
    backgroundColor: "#E8F4EF",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 6
  },
  actionPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.primary
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 30,
    alignItems: "center"
  },
  emptyText: {
    fontSize: 15,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
    marginTop: 12
  },
  emptySubtext: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: "center"
  },
  emptyCtaBtn: {
    marginTop: 14,
    backgroundColor: "#E8F4EF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8
  },
  emptyCtaText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(24, 32, 29, 0.4)",
    justifyContent: "flex-end"
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: typography.weights.heavy,
    color: colors.textMain
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 14
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    padding: 8,
    marginBottom: 10
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 11,
    fontWeight: "600"
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 4,
    marginTop: 8
  },
  textInput: {
    backgroundColor: "#F7F8F6",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.textMain
  },
  purposeRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
    marginBottom: 14
  },
  purposeBtn: {
    flex: 1,
    backgroundColor: "#F7F8F6",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center"
  },
  purposeBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  purposeBtnText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textMuted
  },
  purposeBtnTextActive: {
    color: "#FFFFFF"
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 8
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  cancelBtnText: {
    color: colors.textMuted,
    fontWeight: "600",
    fontSize: 13
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
    gap: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textMain,
    paddingVertical: 0
  },
  clearSearchBtn: {
    fontSize: 13,
    color: colors.textMuted,
    paddingHorizontal: 4
  }
});
