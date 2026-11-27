import React, { useState, useEffect, useRef } from "react";
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
  RefreshControl,
  Platform,
  Keyboard,
  Dimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { StatusPill } from "../components/StatusPill";
import { IconBox } from "../components/IconBox";
import { mobileApiClient } from "../services/api-client";
import { Visitor, VisitorStatus, VisitorType } from "@apartment/shared";
import {
  ShieldIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
  SearchIcon
} from "../components/MobileIcons";

type FilterTab = "ALL" | "PENDING" | "APPROVED" | "INSIDE" | "HISTORY";

export function VisitorsScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<any>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [search, setSearch] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("ALL");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Pre-approve modal
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [visitorType, setVisitorType] = useState<VisitorType>("GUEST");
  const [purpose, setPurpose] = useState("GUEST");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Detail modal
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);

  // Reject modal
  const [rejectModalVisible, setRejectModalVisible] = useState<boolean>(false);
  const [rejectingVisitorId, setRejectingVisitorId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const bottomInset = insets.bottom > 0 ? insets.bottom : Platform.OS === "android" ? 48 : 0;
  const modalBottomPadding = keyboardHeight > 0 ? 16 : bottomInset + 16;
  const windowHeight = Dimensions.get("window").height;
  const maxModalHeight =
    keyboardHeight > 0
      ? Math.max(260, windowHeight - keyboardHeight - (insets.top > 0 ? insets.top : 24) - 20)
      : Math.min(windowHeight * 0.88, windowHeight - bottomInset - 40);

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
        purpose: purpose.trim() || visitorType,
        expectedArrival: arrival,
        visitorType,
        vehicleNumber: vehicleNumber.trim() || undefined,
        notes: notes.trim() || undefined
      });

      setVisitors([newVisitor, ...visitors]);
      setModalVisible(false);
      setVisitorName("");
      setVisitorPhone("");
      setPurpose("GUEST");
      setVisitorType("GUEST");
      setVehicleNumber("");
      setNotes("");

      Alert.alert(
        "Digital Gate Pass Issued",
        `Pass Code: ${newVisitor.accessCode}\n\nShare this pass code with ${newVisitor.visitorName} for instant clearance at society security gates.`
      );
    } catch (err: any) {
      setFormError(err.message || "Failed to create visitor pass.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (visitorId: string) => {
    setActionLoading(true);
    try {
      const updated = await mobileApiClient.approveVisitor(visitorId);
      setVisitors((prev) => prev.map((v) => (v.id === visitorId ? updated : v)));
      if (selectedVisitor?.id === visitorId) {
        setSelectedVisitor(updated);
      }
      Alert.alert("Visitor Approved", "Security at Main Gate 1 has been notified to allow entry.");
    } catch (err: any) {
      Alert.alert("Approval Failed", err.message || "Could not approve visitor.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenReject = (visitorId: string) => {
    setRejectingVisitorId(visitorId);
    setRejectionReason("Not expecting this visitor");
    setRejectModalVisible(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectingVisitorId) return;
    setActionLoading(true);
    try {
      const updated = await mobileApiClient.rejectVisitor(
        rejectingVisitorId,
        rejectionReason || "Entry declined by resident"
      );
      setVisitors((prev) => prev.map((v) => (v.id === rejectingVisitorId ? updated : v)));
      if (selectedVisitor?.id === rejectingVisitorId) {
        setSelectedVisitor(updated);
      }
      setRejectModalVisible(false);
      setRejectingVisitorId(null);
      Alert.alert("Entry Declined", "Gate security has been instructed to turn away this visitor.");
    } catch (err: any) {
      Alert.alert("Decline Failed", err.message || "Could not decline entry.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (visitorId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const updated = await mobileApiClient.updateVisitorStatus(visitorId, newStatus);
      setVisitors((prev) => prev.map((v) => (v.id === visitorId ? updated : v)));
      if (selectedVisitor?.id === visitorId) {
        setSelectedVisitor(updated);
      }
    } catch (err: any) {
      Alert.alert("Update Failed", err.message || "Could not update status.");
    } finally {
      setActionLoading(false);
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

  const getStatusTone = (
    status: VisitorStatus
  ): "teal" | "green" | "orange" | "red" => {
    switch (status) {
      case "CHECKED_IN":
        return "green";
      case "PENDING":
      case "AT_GATE":
        return "orange";
      case "REJECTED":
      case "CANCELLED":
        return "red";
      case "APPROVED":
      case "PRE_APPROVED":
      default:
        return "teal";
    }
  };

  const pendingVisitors = visitors.filter(
    (v) => v.status === "PENDING" || v.status === "AT_GATE"
  );
  const insideCount = visitors.filter((v) => v.status === "CHECKED_IN").length;
  const approvedCount = visitors.filter(
    (v) => v.status === "APPROVED" || v.status === "PRE_APPROVED"
  ).length;
  const historyCount = visitors.filter(
    (v) =>
      v.status === "CHECKED_OUT" ||
      v.status === "REJECTED" ||
      v.status === "CANCELLED" ||
      v.status === "EXPIRED"
  ).length;

  const getEmptyStateContent = () => {
    if (search.trim()) {
      return {
        title: "No matching passes",
        subtext: `No visitor passes found matching "${search}".`,
        showCta: false
      };
    }
    switch (activeFilter) {
      case "PENDING":
        return {
          title: "No Pending Approvals",
          subtext: "All gate entry requests have been addressed.",
          showCta: false
        };
      case "APPROVED":
        return {
          title: "No Expected Visitors",
          subtext: "No upcoming pre-approved visitor passes scheduled for today.",
          showCta: true
        };
      case "INSIDE":
        return {
          title: "No Visitors Currently Inside",
          subtext: "No active guests are currently checked into your flat.",
          showCta: false
        };
      case "HISTORY":
        return {
          title: "No Past Visitors",
          subtext: "Your completed visitor entries and history will appear here.",
          showCta: false
        };
      case "ALL":
      default:
        return {
          title: "No Active Visitor Passes",
          subtext: "Generate a digital gate pass for deliveries, cab drivers, or guests.",
          showCta: true
        };
    }
  };

  const emptyState = getEmptyStateContent();

  const filteredVisitors = visitors.filter((v) => {
    const q = search.toLowerCase();
    const matchesSearch =
      v.visitorName.toLowerCase().includes(q) ||
      v.visitorPhone.includes(q) ||
      v.accessCode.toLowerCase().includes(q) ||
      (v.purpose && v.purpose.toLowerCase().includes(q)) ||
      (v.vehicleNumber && v.vehicleNumber.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (activeFilter === "PENDING") {
      return v.status === "PENDING" || v.status === "AT_GATE";
    }
    if (activeFilter === "APPROVED") {
      return v.status === "APPROVED" || v.status === "PRE_APPROVED";
    }
    if (activeFilter === "INSIDE") {
      return v.status === "CHECKED_IN";
    }
    if (activeFilter === "HISTORY") {
      return (
        v.status === "CHECKED_OUT" ||
        v.status === "REJECTED" ||
        v.status === "CANCELLED" ||
        v.status === "EXPIRED"
      );
    }
    return true;
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
        {/* Gate Live Monitor Dashboard Banner */}
        <View style={styles.gateBanner}>
          <View style={styles.gateLiveTag}>
            <View style={styles.livePulseDot} />
            <Text style={styles.gateLiveText}>MY GATE • PERIMETER VERIFICATION</Text>
          </View>
          <Text style={styles.gateTitle}>
            {insideCount === 1 ? "1 Visitor Currently Inside" : `${insideCount} Visitors Currently Inside`}
          </Text>
          <Text style={styles.gateSubtitle}>
            Pre-approved passes, walk-in clearances & gate history
          </Text>

          <View style={styles.countersRow}>
            <View style={styles.counterBox}>
              <Text style={styles.counterNum}>{visitors.length}</Text>
              <Text style={styles.counterLabel}>Total Passes</Text>
            </View>
            <View style={styles.counterDivider} />
            <View style={styles.counterBox}>
              <Text style={[styles.counterNum, { color: colors.primary }]}>{insideCount}</Text>
              <Text style={styles.counterLabel}>Inside Flat</Text>
            </View>
            <View style={styles.counterDivider} />
            <View style={styles.counterBox}>
              <Text
                style={[
                  styles.counterNum,
                  { color: pendingVisitors.length > 0 ? colors.warning : colors.textMain }
                ]}
              >
                {pendingVisitors.length}
              </Text>
              <Text style={styles.counterLabel}>Pending Action</Text>
            </View>
            <View style={styles.counterDivider} />
            <View style={styles.counterBox}>
              <Text style={[styles.counterNum, { color: colors.primary }]}>{approvedCount}</Text>
              <Text style={styles.counterLabel}>Expected Today</Text>
            </View>
          </View>
        </View>

        {/* High-Priority Urgent Action Card for Walk-In / Pending Visitors */}
        {pendingVisitors.length > 0 && (
          <View style={styles.urgentBanner}>
            <View style={styles.urgentHeader}>
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentBadgeText}>⚠️ GATE ENTRY AWAITING APPROVAL</Text>
              </View>
              <Text style={styles.urgentCountText}>
                {pendingVisitors.length} Request{pendingVisitors.length > 1 ? "s" : ""}
              </Text>
            </View>

            {pendingVisitors.map((pv) => (
              <View key={pv.id} style={styles.urgentCard}>
                <View style={styles.urgentCardTop}>
                  <IconBox
                    symbol={getPurposeIcon(pv.purpose)}
                    tone="orange"
                    size={40}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.urgentVisitorName}>{pv.visitorName}</Text>
                    <Text style={styles.urgentVisitorMeta}>
                      {pv.visitorType || pv.purpose} • {pv.visitorPhone}
                    </Text>
                    <Text style={styles.urgentGateNote}>
                      {pv.entryType === "WALK_IN"
                        ? "Waiting at Main Gate 1 (Security Request)"
                        : "Arrival pending verification"}
                    </Text>
                  </View>
                </View>

                <View style={styles.urgentActions}>
                  <TouchableOpacity
                    style={styles.declineBtn}
                    onPress={() => handleOpenReject(pv.id)}
                    disabled={actionLoading}
                  >
                    <Text style={styles.declineBtnText}>✕ Decline</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => handleApprove(pv.id)}
                    disabled={actionLoading}
                  >
                    <Text style={styles.approveBtnText}>✓ Approve Entry</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Action Header & Pre-Approve Button */}
        <View style={styles.listHeader}>
          <View style={styles.listHeaderLeft}>
            <Text style={styles.sectionTitle}>Gate Register</Text>
            <Text style={styles.sectionSubtitle} numberOfLines={1}>
              Active digital passes & entry timeline
            </Text>
          </View>
          <TouchableOpacity
            style={styles.preApproveBtn}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <PlusIcon size={14} color="#ffffff" strokeWidth={2.5} />
            <Text style={styles.preApproveText}>Pre-Approve</Text>
          </TouchableOpacity>
        </View>

        {/* Category Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsRow}
        >
          {(
            [
              { key: "ALL", label: `All (${visitors.length})` },
              {
                key: "PENDING",
                label: `Pending (${pendingVisitors.length})`,
                hasBadge: pendingVisitors.length > 0
              },
              { key: "APPROVED", label: `Expected (${approvedCount})` },
              { key: "INSIDE", label: `Inside (${insideCount})` },
              { key: "HISTORY", label: `History (${historyCount})` }
            ] as const
          ).map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => setActiveFilter(tab.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    isActive && styles.filterTabTextActive,
                    Boolean((tab as any).hasBadge) && { color: colors.warning }
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Search Bar when visitors exist */}
        {visitors.length > 0 && (
          <View style={styles.searchBarContainer}>
            <SearchIcon size={16} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, pass code, vehicle..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
              selectionColor={colors.primary}
              cursorColor={colors.primary}
            />
            {search.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearch("")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.clearSearchBtn}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Visitor Cards List */}
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 24 }} />
        ) : filteredVisitors.length === 0 ? (
          <View style={styles.emptyCard}>
            <IconBox symbol="shield" tone="emerald" size={38} />
            <Text style={styles.emptyText}>{emptyState.title}</Text>
            <Text style={styles.emptySubtext}>{emptyState.subtext}</Text>
            {emptyState.showCta && (
              <TouchableOpacity
                style={styles.emptyCtaBtn}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
              >
                <PlusIcon size={13} color="#ffffff" strokeWidth={2.5} />
                <Text style={styles.emptyCtaText}>Pre-Approve Visitor</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.visitorList}>
            {filteredVisitors.map((visitor, index) => (
              <TouchableOpacity
                key={visitor.id}
                style={[
                  styles.visitorRow,
                  index === filteredVisitors.length - 1 && { borderBottomWidth: 0 }
                ]}
                onPress={() => setSelectedVisitor(visitor)}
                activeOpacity={0.7}
              >
                <IconBox
                  symbol={getPurposeIcon(visitor.purpose)}
                  tone={getStatusTone(visitor.status)}
                  size={42}
                />

                <View style={styles.visitorDetails}>
                  <View style={styles.visitorNameRow}>
                    <Text style={styles.visitorName} numberOfLines={1}>
                      {visitor.visitorName}
                    </Text>
                    {visitor.entryType === "WALK_IN" && (
                      <View style={styles.walkInBadge}>
                        <Text style={styles.walkInBadgeText}>WALK-IN</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.visitorPurpose} numberOfLines={1}>
                    {visitor.visitorType || visitor.purpose} • {visitor.visitorPhone}
                  </Text>

                  {Boolean(visitor.vehicleNumber) && (
                    <Text style={styles.vehicleText}>🚗 {visitor.vehicleNumber}</Text>
                  )}

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

                  {visitor.status === "PENDING" && (
                    <View style={{ flexDirection: "row", gap: 4, marginTop: 4 }}>
                      <TouchableOpacity
                        style={styles.cardQuickDecline}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleOpenReject(visitor.id);
                        }}
                      >
                        <Text style={styles.cardQuickDeclineText}>✕</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cardQuickApprove}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleApprove(visitor.id);
                        }}
                      >
                        <Text style={styles.cardQuickApproveText}>Approve</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {visitor.status === "CHECKED_IN" && (
                    <TouchableOpacity
                      style={[styles.actionPillBtn, { backgroundColor: "#FEE2E2" }]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(visitor.id, "CHECKED_OUT");
                      }}
                    >
                      <Text style={[styles.actionPillText, { color: colors.danger }]}>
                        Check Out
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 1. Pre-Approve Visitor Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          Keyboard.dismiss();
          setModalVisible(false);
        }}
      >
        <View style={[styles.modalOverlay, { paddingBottom: keyboardHeight }]}>
          <View
            style={[
              styles.modalContent,
              {
                paddingBottom: modalBottomPadding,
                maxHeight: maxModalHeight
              }
            ]}
          >
            <ScrollView
              ref={scrollRef}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              contentContainerStyle={{ paddingBottom: keyboardHeight > 0 ? 24 : 10 }}
            >
              <Text style={styles.modalTitle}>Pre-Approve Visitor</Text>
              <Text style={styles.modalSubtitle}>
                Issue an OTP entry pass for instant clearance at the security gate
              </Text>

              {formError && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{formError}</Text>
                </View>
              )}

              <Text style={styles.inputLabel}>VISITOR CATEGORY</Text>
              <View style={styles.purposeRow}>
                {(["GUEST", "DELIVERY", "CAB", "SERVICE", "OTHER"] as VisitorType[]).map((vt) => (
                  <TouchableOpacity
                    key={vt}
                    style={[styles.purposeBtn, visitorType === vt && styles.purposeBtnActive]}
                    onPress={() => {
                      setVisitorType(vt);
                      if (vt !== "OTHER") setPurpose(vt);
                    }}
                  >
                    <Text
                      style={[
                        styles.purposeBtnText,
                        visitorType === vt && styles.purposeBtnTextActive
                      ]}
                    >
                      {vt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>VISITOR FULL NAME</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Ramesh Kumar / Flipkart Agent"
                placeholderTextColor={colors.textMuted}
                value={visitorName}
                onChangeText={setVisitorName}
                selectionColor={colors.primary}
                cursorColor={colors.primary}
              />

              <Text style={styles.inputLabel}>PHONE NUMBER</Text>
              <TextInput
                style={styles.textInput}
                placeholder="+91 98765 43210"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                value={visitorPhone}
                onChangeText={setVisitorPhone}
                selectionColor={colors.primary}
                cursorColor={colors.primary}
              />

              <Text style={styles.inputLabel}>VEHICLE NUMBER (OPTIONAL)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. KA-01-AB-1234"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
                value={vehicleNumber}
                onChangeText={setVehicleNumber}
                selectionColor={colors.primary}
                cursorColor={colors.primary}
              />

              <Text style={styles.inputLabel}>SPECIAL INSTRUCTIONS / NOTES (OPTIONAL)</Text>
              <TextInput
                style={[styles.textInput, { height: 64, textAlignVertical: "top" }]}
                placeholder="e.g. Leave parcel at front door if not answered"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={2}
                value={notes}
                onChangeText={setNotes}
                selectionColor={colors.primary}
                cursorColor={colors.primary}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    Keyboard.dismiss();
                    setModalVisible(false);
                  }}
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
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 2. Visitor Details Modal */}
      <Modal
        visible={selectedVisitor !== null}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedVisitor(null)}
      >
        <View style={styles.detailOverlay}>
          <View style={styles.detailCard}>
            {selectedVisitor && (
              <>
                <View style={styles.detailHeader}>
                  <View>
                    <Text style={styles.detailTitle}>{selectedVisitor.visitorName}</Text>
                    <Text style={styles.detailSubtitle}>
                      {selectedVisitor.visitorType || selectedVisitor.purpose} • Flat{" "}
                      {selectedVisitor.unitNumber || "402"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedVisitor(null)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.detailCloseBtn}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Big Pass Code Display */}
                <View style={styles.detailPassCodeBox}>
                  <Text style={styles.detailPassCodeLabel}>GATE CLEARANCE PASS CODE</Text>
                  <Text style={styles.detailPassCodeText}>{selectedVisitor.accessCode}</Text>
                  <Text style={styles.detailPassCodeSub}>
                    Show or read this code to gate security upon arrival
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailRowLabel}>Status</Text>
                  <StatusPill
                    label={selectedVisitor.status.replace("_", " ")}
                    tone={getStatusTone(selectedVisitor.status)}
                  />
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailRowLabel}>Contact</Text>
                  <Text style={styles.detailRowVal}>{selectedVisitor.visitorPhone}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailRowLabel}>Entry Channel</Text>
                  <Text style={styles.detailRowVal}>
                    {selectedVisitor.entryType === "WALK_IN"
                      ? "Walk-in (Created by Gate Security)"
                      : "Resident Pre-approved Pass"}
                  </Text>
                </View>

                {Boolean(selectedVisitor.vehicleNumber) && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>Vehicle</Text>
                    <Text style={styles.detailRowVal}>{selectedVisitor.vehicleNumber}</Text>
                  </View>
                )}

                {Boolean(selectedVisitor.notes) && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>Notes</Text>
                    <Text style={styles.detailRowVal}>{selectedVisitor.notes}</Text>
                  </View>
                )}

                {Boolean(selectedVisitor.rejectionReason) && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailRowLabel, { color: colors.danger }]}>
                      Decline Reason
                    </Text>
                    <Text style={[styles.detailRowVal, { color: colors.danger }]}>
                      {selectedVisitor.rejectionReason}
                    </Text>
                  </View>
                )}

                <View style={styles.detailActions}>
                  {selectedVisitor.status === "PENDING" && (
                    <>
                      <TouchableOpacity
                        style={styles.detailDeclineBtn}
                        onPress={() => {
                          const id = selectedVisitor.id;
                          setSelectedVisitor(null);
                          handleOpenReject(id);
                        }}
                      >
                        <Text style={styles.detailDeclineText}>✕ Decline Entry</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.detailApproveBtn}
                        onPress={() => handleApprove(selectedVisitor.id)}
                      >
                        <Text style={styles.detailApproveText}>✓ Approve Entry</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {selectedVisitor.status === "CHECKED_IN" && (
                    <TouchableOpacity
                      style={[styles.detailDeclineBtn, { backgroundColor: "#FEE2E2", flex: 1 }]}
                      onPress={() => handleUpdateStatus(selectedVisitor.id, "CHECKED_OUT")}
                    >
                      <Text style={[styles.detailDeclineText, { color: colors.danger }]}>
                        Record Check Out
                      </Text>
                    </TouchableOpacity>
                  )}

                  {(selectedVisitor.status === "APPROVED" ||
                    selectedVisitor.status === "PRE_APPROVED") && (
                    <TouchableOpacity
                      style={[styles.detailDeclineBtn, { flex: 1 }]}
                      onPress={() => handleUpdateStatus(selectedVisitor.id, "CANCELLED")}
                    >
                      <Text style={styles.detailDeclineText}>Cancel Pass</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* 3. Rejection Reason Modal */}
      <Modal
        visible={rejectModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <View style={styles.detailOverlay}>
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>Decline Visitor Entry</Text>
            <Text style={styles.detailSubtitle}>
              Select a reason to record and instruct gate security
            </Text>

            <View style={{ gap: 8, marginTop: 12, marginBottom: 16 }}>
              {[
                "Not expecting this visitor",
                "Not available at home",
                "Wrong apartment unit address",
                "Instruct visitor to leave parcel at gate"
              ].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.reasonChip,
                    rejectionReason === r && styles.reasonChipActive
                  ]}
                  onPress={() => setRejectionReason(r)}
                >
                  <Text
                    style={[
                      styles.reasonChipText,
                      rejectionReason === r && styles.reasonChipTextActive
                    ]}
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="Or type a custom decline note..."
              placeholderTextColor={colors.textMuted}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              selectionColor={colors.primary}
              cursorColor={colors.primary}
            />

            <View style={[styles.modalActions, { marginTop: 16 }]}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setRejectModalVisible(false);
                  setRejectingVisitorId(null);
                }}
                disabled={actionLoading}
              >
                <Text style={styles.cancelBtnText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.danger }]}
                onPress={handleConfirmReject}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>Confirm Decline</Text>
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
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1
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
    fontSize: 9.5,
    color: colors.textMuted,
    marginTop: 1,
    textAlign: "center"
  },
  counterDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border
  },
  urgentBanner: {
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
    padding: 14,
    marginBottom: 18
  },
  urgentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  urgentBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  urgentBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#B45309",
    letterSpacing: 0.5
  },
  urgentCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#B45309"
  },
  urgentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#FDE68A"
  },
  urgentCardTop: {
    flexDirection: "row",
    alignItems: "center"
  },
  urgentVisitorName: {
    fontSize: 14,
    fontWeight: typography.weights.bold,
    color: colors.textMain
  },
  urgentVisitorMeta: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 1
  },
  urgentGateNote: {
    fontSize: 11,
    color: "#D97706",
    fontWeight: "600",
    marginTop: 2
  },
  urgentActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12
  },
  declineBtn: {
    flex: 1,
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center"
  },
  declineBtnText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: colors.danger
  },
  approveBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center"
  },
  approveBtnText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#FFFFFF"
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 2
  },
  listHeaderLeft: {
    flex: 1,
    marginRight: 10
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
    gap: 4,
    flexShrink: 0
  },
  preApproveText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: typography.weights.bold
  },
  filterTabsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 2,
    paddingRight: 20
  },
  filterTab: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 13,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center"
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  filterTabText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: colors.textMuted
  },
  filterTabTextActive: {
    color: "#FFFFFF"
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginBottom: 14,
    gap: 8,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1
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
  },
  visitorList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1
  },
  visitorRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle
  },
  visitorDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8
  },
  visitorNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  visitorName: {
    fontSize: 14,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
    flexShrink: 1
  },
  walkInBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4
  },
  walkInBadgeText: {
    fontSize: 8.5,
    fontWeight: "800",
    color: "#B45309"
  },
  visitorPurpose: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 2
  },
  vehicleText: {
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 2
  },
  codeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
    marginTop: 5,
    gap: 4
  },
  codeBadgeLabel: {
    fontSize: 8.5,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 0.5
  },
  codeBadgeValue: {
    fontSize: 11.5,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 1
  },
  statusCol: {
    alignItems: "flex-end",
    gap: 6
  },
  cardQuickApprove: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  cardQuickApproveText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF"
  },
  cardQuickDecline: {
    backgroundColor: "#FEE2E2",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4
  },
  cardQuickDeclineText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.danger
  },
  actionPillBtn: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    marginTop: 2
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
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1
  },
  emptyText: {
    fontSize: 15,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
    marginTop: 8
  },
  emptySubtext: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 3,
    textAlign: "center",
    lineHeight: 16
  },
  emptyCtaBtn: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 1
  },
  emptyCtaText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end"
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    paddingBottom: 34
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: typography.weights.heavy,
    color: colors.textMain,
    letterSpacing: -0.3
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 16
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FECACA"
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 11.5,
    fontWeight: "600"
  },
  inputLabel: {
    fontSize: 9.5,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 0.7,
    marginBottom: 5,
    marginTop: 10
  },
  textInput: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13.5,
    color: colors.textMain
  },
  purposeRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
    marginBottom: 10
  },
  purposeBtn: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center"
  },
  purposeBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  purposeBtnText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: colors.textMuted
  },
  purposeBtnTextActive: {
    color: "#FFFFFF"
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 14
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10
  },
  cancelBtnText: {
    color: colors.textMuted,
    fontWeight: "600",
    fontSize: 13
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 11,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13
  },
  detailOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  detailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: typography.weights.heavy,
    color: colors.textMain
  },
  detailSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1
  },
  detailCloseBtn: {
    fontSize: 16,
    color: colors.textMuted,
    padding: 4
  },
  detailPassCodeBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
    padding: 14,
    alignItems: "center",
    marginBottom: 14
  },
  detailPassCodeLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 0.7
  },
  detailPassCodeText: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.primary,
    letterSpacing: 2,
    marginVertical: 4
  },
  detailPassCodeSub: {
    fontSize: 10.5,
    color: colors.textMuted,
    textAlign: "center"
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle
  },
  detailRowLabel: {
    fontSize: 11.5,
    fontWeight: "600",
    color: colors.textMuted
  },
  detailRowVal: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMain
  },
  detailActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16
  },
  detailDeclineBtn: {
    flex: 1,
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center"
  },
  detailDeclineText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.danger
  },
  detailApproveBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center"
  },
  detailApproveText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF"
  },
  reasonChip: {
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  reasonChipActive: {
    backgroundColor: "#FEE2E2",
    borderColor: colors.danger
  },
  reasonChipText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: colors.textMain
  },
  reasonChipTextActive: {
    color: colors.danger,
    fontWeight: "700"
  }
});
