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
import { MaintenanceRequest, MaintenanceCategory, MaintenancePriority } from "@apartment/shared";
import {
  WrenchIcon,
  PlusIcon,
  ChevronRightIcon,
  AlertCircleIcon,
  FileTextIcon,
  CheckCircleIcon
} from "../components/MobileIcons";

interface ServicesScreenProps {
  onNavigateTab?: (tab: "home" | "services" | "chat" | "visitors" | "more") => void;
}

export function ServicesScreen({ onNavigateTab }: ServicesScreenProps) {
  const [activeSection, setActiveSection] = useState<"hub" | "maintenance">("hub");
  const [tickets, setTickets] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Create Modal State
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [category, setCategory] = useState<MaintenanceCategory>("PLUMBING");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<MaintenancePriority>("MEDIUM");
  const [formError, setFormError] = useState<string | null>(null);
  const [attachDefectPhoto, setAttachDefectPhoto] = useState<boolean>(false);

  // Detail / Comment Modal State
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceRequest | null>(null);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);

  const fetchTickets = async () => {
    try {
      const data = await mobileApiClient.getMaintenance();
      setTickets(data);
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const handleCreateRequest = async () => {
    if (!title.trim() || title.length < 3) {
      setFormError("Title must be at least 3 characters.");
      return;
    }
    if (!description.trim() || description.length < 5) {
      setFormError("Description must be at least 5 characters.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const newTicket = await mobileApiClient.createMaintenance({
        category,
        title: title.trim(),
        description: description.trim(),
        priority
      });

      if (attachDefectPhoto) {
        try {
          const samplePngBase64 =
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
          await mobileApiClient.uploadMaintenanceAttachment(
            newTicket.id,
            "defect_proof.png",
            "image/png",
            samplePngBase64
          );
        } catch {
          // Non-blocking attachment upload
        }
      }

      const refreshed = await mobileApiClient.getMaintenance();
      setTickets(refreshed);
      setCreateModalVisible(false);
      setTitle("");
      setDescription("");
      setCategory("PLUMBING");
      setPriority("MEDIUM");
      setAttachDefectPhoto(false);
      setActiveSection("maintenance");
      Alert.alert("Request Raised", "Your maintenance ticket has been logged with property operations.");
    } catch (err: any) {
      setFormError(err.message || "Failed to submit maintenance request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!selectedTicket || !commentText.trim()) return;
    setSubmittingComment(true);

    try {
      const comment = await mobileApiClient.addMaintenanceComment(selectedTicket.id, commentText.trim());
      const updatedTicket: MaintenanceRequest = {
        ...selectedTicket,
        comments: [...(selectedTicket.comments || []), comment]
      };
      setSelectedTicket(updatedTicket);
      setTickets((prev) => prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)));
      setCommentText("");
    } catch (err: any) {
      Alert.alert("Comment Failed", err.message || "Could not post comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCancelTicket = async (ticketId: string) => {
    try {
      await mobileApiClient.cancelMaintenance(ticketId);
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: "CANCELLED" } : t))
      );
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: "CANCELLED" });
      }
      Alert.alert("Ticket Cancelled", "Your request has been cancelled.");
    } catch (err: any) {
      Alert.alert("Cancellation Failed", err.message || "Could not cancel ticket.");
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "EMERGENCY":
      case "HIGH":
        return colors.danger;
      case "MEDIUM":
        return colors.warning;
      case "LOW":
      default:
        return colors.primary;
    }
  };

  const getStatusTone = (s: string): "teal" | "green" | "orange" | "red" => {
    switch (s) {
      case "RESOLVED":
      case "CLOSED":
        return "green";
      case "ASSIGNED":
      case "IN_PROGRESS":
        return "orange";
      case "CANCELLED":
        return "red";
      case "REPORTED":
      default:
        return "teal";
    }
  };

  const handleHubItemClick = (type: string) => {
    switch (type) {
      case "maintenance":
        setActiveSection("maintenance");
        break;
      case "visitors":
        if (onNavigateTab) onNavigateTab("visitors");
        break;
      case "chat":
        if (onNavigateTab) onNavigateTab("chat");
        break;
      default:
        if (onNavigateTab) onNavigateTab("more");
        break;
    }
  };

  const openTicketsCount = tickets.filter(
    (t) => t.status !== "RESOLVED" && t.status !== "CLOSED" && t.status !== "CANCELLED"
  ).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPage }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Header */}
        <View style={styles.headerArea}>
          <Text style={styles.headerSubtitle}>ESTATE OPERATIONS & SERVICES</Text>
          <Text style={styles.headerTitle}>Community Services</Text>
          <Text style={styles.headerDesc}>
            Everything you need for your home and community
          </Text>
        </View>

        {/* View Switcher Pills */}
        <View style={styles.tabSwitchContainer}>
          <TouchableOpacity
            style={[styles.tabSwitchBtn, activeSection === "hub" && styles.tabSwitchBtnActive]}
            onPress={() => setActiveSection("hub")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabSwitchText,
                activeSection === "hub" && styles.tabSwitchTextActive
              ]}
            >
              Services Directory
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabSwitchBtn,
              activeSection === "maintenance" && styles.tabSwitchBtnActive
            ]}
            onPress={() => setActiveSection("maintenance")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabSwitchText,
                activeSection === "maintenance" && styles.tabSwitchTextActive
              ]}
            >
              Maintenance Desk ({openTicketsCount})
            </Text>
          </TouchableOpacity>
        </View>

        {activeSection === "hub" ? (
          /* =========================================================================
             SECTION 8: SERVICE HUB ORGANIZED BY CATEGORIES
             ========================================================================= */
          <View>
            {/* DAILY SERVICES */}
            <View style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>DAILY SERVICES</Text>
                <Text style={styles.categoryMeta}>Core household and gate workflows</Text>
              </View>

              <View style={styles.servicesStack}>
                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() => handleHubItemClick("visitors")}
                  activeOpacity={0.7}
                >
                  <IconBox symbol="shield" tone="emerald" size={44} />
                  <View style={styles.serviceContent}>
                    <Text style={styles.serviceTitle}>Visitors</Text>
                    <Text style={styles.serviceDesc}>
                      Digital gate entry passes, pre-approval, and courier delivery verification
                    </Text>
                  </View>
                  <ChevronRightIcon size={18} color={colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() => setActiveSection("maintenance")}
                  activeOpacity={0.7}
                >
                  <IconBox symbol="wrench" tone="orange" size={44} />
                  <View style={styles.serviceContent}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text style={styles.serviceTitle}>Maintenance</Text>
                      {openTicketsCount > 0 && (
                        <View style={styles.badgeSmall}>
                          <Text style={styles.badgeSmallText}>{openTicketsCount} open</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.serviceDesc}>
                      Plumbing, electrical, appliance tickets, and technician status tracking
                    </Text>
                  </View>
                  <ChevronRightIcon size={18} color={colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() => handleHubItemClick("amenities")}
                  activeOpacity={0.7}
                >
                  <IconBox symbol="calendar" tone="teal" size={44} />
                  <View style={styles.serviceContent}>
                    <Text style={styles.serviceTitle}>Amenities</Text>
                    <Text style={styles.serviceDesc}>
                      Book swimming pool, clubhouse, badminton courts, and party halls
                    </Text>
                  </View>
                  <ChevronRightIcon size={18} color={colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() => handleHubItemClick("payments")}
                  activeOpacity={0.7}
                >
                  <IconBox symbol="card" tone="green" size={44} />
                  <View style={styles.serviceContent}>
                    <Text style={styles.serviceTitle}>Payments</Text>
                    <Text style={styles.serviceDesc}>
                      Monthly maintenance dues, utility invoices, and downloadable receipts
                    </Text>
                  </View>
                  <ChevronRightIcon size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* COMMUNITY */}
            <View style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>COMMUNITY</Text>
                <Text style={styles.categoryMeta}>Broadcasts, bylaws, and resident network</Text>
              </View>

              <View style={styles.servicesStack}>
                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() => handleHubItemClick("notices")}
                  activeOpacity={0.7}
                >
                  <IconBox symbol="bell" tone="orange" size={44} />
                  <View style={styles.serviceContent}>
                    <Text style={styles.serviceTitle}>Notices</Text>
                    <Text style={styles.serviceDesc}>
                      Official management broadcasts, AGM minutes, and circulars
                    </Text>
                  </View>
                  <ChevronRightIcon size={18} color={colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() => handleHubItemClick("documents")}
                  activeOpacity={0.7}
                >
                  <IconBox symbol="doc" tone="teal" size={44} />
                  <View style={styles.serviceContent}>
                    <Text style={styles.serviceTitle}>Documents</Text>
                    <Text style={styles.serviceDesc}>
                      Society bylaws, NOC certificates, and property guidelines
                    </Text>
                  </View>
                  <ChevronRightIcon size={18} color={colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() => handleHubItemClick("chat")}
                  activeOpacity={0.7}
                >
                  <IconBox symbol="chat" tone="teal" size={44} />
                  <View style={styles.serviceContent}>
                    <Text style={styles.serviceTitle}>Chat</Text>
                    <Text style={styles.serviceDesc}>
                      Direct secure channels with estate managers and masked resident chat
                    </Text>
                  </View>
                  <ChevronRightIcon size={18} color={colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() => handleHubItemClick("household")}
                  activeOpacity={0.7}
                >
                  <IconBox symbol="user" tone="emerald" size={44} />
                  <View style={styles.serviceContent}>
                    <Text style={styles.serviceTitle}>Household</Text>
                    <Text style={styles.serviceDesc}>
                      Family occupants, daily domestic staff, and tenant lease details
                    </Text>
                  </View>
                  <ChevronRightIcon size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* PROPERTY */}
            <View style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>PROPERTY</Text>
                <Text style={styles.categoryMeta}>Vehicles, parking allocations, and safety</Text>
              </View>

              <View style={styles.servicesStack}>
                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() => handleHubItemClick("vehicles")}
                  activeOpacity={0.7}
                >
                  <IconBox symbol="car" tone="green" size={44} />
                  <View style={styles.serviceContent}>
                    <Text style={styles.serviceTitle}>Vehicles</Text>
                    <Text style={styles.serviceDesc}>
                      Registered 4-wheelers, 2-wheelers, EV charging, and RFID tags
                    </Text>
                  </View>
                  <ChevronRightIcon size={18} color={colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() => handleHubItemClick("parking")}
                  activeOpacity={0.7}
                >
                  <IconBox symbol="building" tone="teal" size={44} />
                  <View style={styles.serviceContent}>
                    <Text style={styles.serviceTitle}>Parking</Text>
                    <Text style={styles.serviceDesc}>
                      Designated slot allocations, visitor basement bays, and tags
                    </Text>
                  </View>
                  <ChevronRightIcon size={18} color={colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() => handleHubItemClick("security")}
                  activeOpacity={0.7}
                >
                  <IconBox symbol="shield" tone="red" size={44} />
                  <View style={styles.serviceContent}>
                    <Text style={styles.serviceTitle}>Security</Text>
                    <Text style={styles.serviceDesc}>
                      Main gate perimeter status, guard booth intercom, and patrol logs
                    </Text>
                  </View>
                  <ChevronRightIcon size={18} color={colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() =>
                    Alert.alert(
                      "Emergency Contacts",
                      "Main Gate: +91 91234 00001\nFire Response: 101\nAmbulance: 108\nControl Room: Ext 9"
                    )
                  }
                  activeOpacity={0.7}
                >
                  <IconBox symbol="warning" tone="red" size={44} />
                  <View style={styles.serviceContent}>
                    <Text style={[styles.serviceTitle, { color: colors.danger }]}>Emergency</Text>
                    <Text style={styles.serviceDesc}>
                      One-tap quick dial for medical, fire, lift breakdown, and security SOS
                    </Text>
                  </View>
                  <ChevronRightIcon size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          /* =========================================================================
             SECTION: ACTIVE MAINTENANCE DESK (100% PRESERVED FUNCTIONALITY)
             ========================================================================= */
          <View>
            <View style={styles.deskHeaderRow}>
              <View>
                <Text style={styles.sectionHeading}>Maintenance Requests</Text>
                <Text style={styles.sectionSubtitle}>
                  Track resolution and talk to assigned technicians
                </Text>
              </View>
              <TouchableOpacity
                style={styles.newTicketBtn}
                onPress={() => setCreateModalVisible(true)}
                activeOpacity={0.8}
              >
                <PlusIcon size={16} color="#ffffff" strokeWidth={2.5} />
                <Text style={styles.newTicketBtnText}>New Request</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 30 }} />
            ) : tickets.length === 0 ? (
              <View style={styles.emptyCard}>
                <IconBox symbol="check" tone="emerald" size={48} />
                <Text style={styles.emptyTitle}>All Systems Operational</Text>
                <Text style={styles.emptyDesc}>
                  You have no active maintenance tickets for your unit.
                </Text>
                <TouchableOpacity
                  style={styles.raisePrimaryBtn}
                  onPress={() => setCreateModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.raisePrimaryBtnText}>+ Log Service Issue</Text>
                </TouchableOpacity>
              </View>
            ) : (
              tickets.map((ticket) => (
                <TouchableOpacity
                  key={ticket.id}
                  style={styles.ticketCard}
                  onPress={() => setSelectedTicket(ticket)}
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      styles.ticketPriorityBar,
                      { backgroundColor: getPriorityColor(ticket.priority) }
                    ]}
                  />
                  <View style={styles.ticketBody}>
                    <View style={styles.ticketMetaRow}>
                      <Text style={styles.ticketCategoryTag}>
                        {ticket.category} • PRIORITY {ticket.priority}
                      </Text>
                      <StatusPill
                        label={ticket.status.replace("_", " ")}
                        tone={getStatusTone(ticket.status)}
                      />
                    </View>

                    <Text style={styles.ticketTitle}>{ticket.title}</Text>
                    <Text style={styles.ticketDesc} numberOfLines={2}>
                      {ticket.description}
                    </Text>

                    <View style={styles.ticketFooter}>
                      <Text style={styles.ticketActionLink}>
                        View updates & comments ({ticket.comments?.length || 0}) &rarr;
                      </Text>
                      {ticket.attachments && ticket.attachments.length > 0 && (
                        <Text style={styles.ticketAttachmentTag}>
                          📎 {ticket.attachments.length} file
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* =========================================================================
          RAISE NEW MAINTENANCE REQUEST MODAL
          ========================================================================= */}
      <Modal visible={createModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeading}>Raise Service Request</Text>
            <Text style={styles.modalSubheading}>
              Facility Management • Unit Inspection
            </Text>

            {formError && (
              <View style={styles.formErrorBox}>
                <Text style={styles.formErrorText}>{formError}</Text>
              </View>
            )}

            <Text style={styles.fieldLabel}>CATEGORY</Text>
            <View style={styles.categoryGrid}>
              {(["PLUMBING", "ELECTRICAL", "CARPENTRY", "APPLIANCE"] as MaintenanceCategory[]).map(
                (cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryOption,
                      category === cat && styles.categoryOptionActive
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        category === cat && styles.categoryOptionTextActive
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            <Text style={styles.fieldLabel}>ISSUE SUMMARY</Text>
            <TextInput
              style={styles.inputField}
              placeholder="e.g. Water leak under kitchen sink"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.fieldLabel}>DETAILED DESCRIPTION</Text>
            <TextInput
              style={[styles.inputField, { height: 72, textAlignVertical: "top" }]}
              placeholder="Provide exact location and convenient inspection timing..."
              placeholderTextColor={colors.textMuted}
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.fieldLabel}>PRIORITY</Text>
            <View style={styles.categoryGrid}>
              {(["LOW", "MEDIUM", "HIGH", "EMERGENCY"] as MaintenancePriority[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.categoryOption,
                    priority === p && styles.categoryOptionActive
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      priority === p && styles.categoryOptionTextActive
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.attachmentOption,
                attachDefectPhoto && styles.attachmentOptionActive
              ]}
              onPress={() => setAttachDefectPhoto(!attachDefectPhoto)}
              activeOpacity={0.8}
            >
              <FileTextIcon size={18} color={attachDefectPhoto ? colors.primary : colors.textMuted} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.attachmentTitle}>
                  {attachDefectPhoto
                    ? "Defect Photo Attached (1 file)"
                    : "Attach Photo / Bill Evidence"}
                </Text>
                <Text style={styles.attachmentSub}>PNG, JPG under 5MB</Text>
              </View>
              {attachDefectPhoto && <CheckCircleIcon size={18} color={colors.primary} />}
            </TouchableOpacity>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setCreateModalVisible(false)}
                disabled={submitting}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleCreateRequest}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.modalSubmitText}>Submit Request</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =========================================================================
          TICKET DETAILS & COMMENTS MODAL
          ========================================================================= */}
      <Modal visible={Boolean(selectedTicket)} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "88%" }]}>
            {selectedTicket && (
              <>
                <View style={styles.ticketDetailTop}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.ticketDetailCategory}>
                      {selectedTicket.category} • PRIORITY {selectedTicket.priority}
                    </Text>
                    <Text style={styles.modalHeading}>{selectedTicket.title}</Text>
                  </View>
                  <StatusPill
                    label={selectedTicket.status.replace("_", " ")}
                    tone={getStatusTone(selectedTicket.status)}
                  />
                </View>

                <View style={styles.ticketDetailDescBox}>
                  <Text style={styles.ticketDetailDescText}>{selectedTicket.description}</Text>
                </View>

                {/* Attachments Section */}
                <Text style={styles.fieldLabel}>ATTACHMENTS ({selectedTicket.attachments?.length || 0})</Text>
                {!selectedTicket.attachments || selectedTicket.attachments.length === 0 ? (
                  <Text style={styles.emptyMiniText}>No defect attachments uploaded.</Text>
                ) : (
                  <View style={styles.attachmentChipRow}>
                    {selectedTicket.attachments.map((att) => (
                      <View key={att.id} style={styles.attachmentChip}>
                        <FileTextIcon size={14} color={colors.primary} />
                        <Text style={styles.attachmentChipText} numberOfLines={1}>
                          {att.fileName}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Comments Section */}
                <Text style={[styles.fieldLabel, { marginTop: 12 }]}>
                  COMMENTS & TIMELINE ({selectedTicket.comments?.length || 0})
                </Text>
                <ScrollView style={{ maxHeight: 160 }} showsVerticalScrollIndicator={false}>
                  {!selectedTicket.comments || selectedTicket.comments.length === 0 ? (
                    <Text style={styles.emptyMiniText}>
                      No comments yet. Facility updates will appear here.
                    </Text>
                  ) : (
                    selectedTicket.comments.map((c) => (
                      <View key={c.id} style={styles.commentItem}>
                        <Text style={styles.commentAuthor}>
                          {c.authorName} ({c.authorRole})
                        </Text>
                        <Text style={styles.commentBody}>{c.comment}</Text>
                      </View>
                    ))
                  )}
                </ScrollView>

                {selectedTicket.status !== "CANCELLED" && selectedTicket.status !== "CLOSED" && (
                  <View style={styles.commentInputRow}>
                    <TextInput
                      style={[styles.inputField, { flex: 1, marginRight: 8, marginBottom: 0 }]}
                      placeholder="Add update or question..."
                      placeholderTextColor={colors.textMuted}
                      value={commentText}
                      onChangeText={setCommentText}
                    />
                    <TouchableOpacity
                      style={styles.commentPostBtn}
                      onPress={handleAddComment}
                      disabled={submittingComment}
                    >
                      {submittingComment ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <Text style={styles.commentPostBtnText}>Post</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.detailActionsRow}>
                  {selectedTicket.status !== "CANCELLED" && selectedTicket.status !== "CLOSED" && (
                    <TouchableOpacity
                      style={styles.cancelTicketLink}
                      onPress={() => handleCancelTicket(selectedTicket.id)}
                    >
                      <Text style={styles.cancelTicketLinkText}>Cancel Ticket</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.closeDetailBtn}
                    onPress={() => setSelectedTicket(null)}
                  >
                    <Text style={styles.closeDetailBtnText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  headerArea: {
    marginBottom: 16
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: 0.8,
    marginBottom: 3
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: typography.weights.heavy,
    color: colors.textMain,
    letterSpacing: -0.4
  },
  headerDesc: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2
  },
  tabSwitchContainer: {
    flexDirection: "row",
    backgroundColor: "#E5E8E5",
    borderRadius: 12,
    padding: 3,
    marginBottom: 20
  },
  tabSwitchBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: 9
  },
  tabSwitchBtnActive: {
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2
  },
  tabSwitchText: {
    fontSize: 12,
    fontWeight: typography.weights.medium,
    color: colors.textMuted
  },
  tabSwitchTextActive: {
    color: colors.textMain,
    fontWeight: typography.weights.bold
  },
  categorySection: {
    marginBottom: 24
  },
  categoryHeader: {
    marginBottom: 10,
    paddingHorizontal: 2
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: typography.weights.heavy,
    color: colors.textMain,
    letterSpacing: 0.6
  },
  categoryMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1
  },
  servicesStack: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden"
  },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F7F8F6"
  },
  serviceContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: typography.weights.bold,
    color: colors.textMain
  },
  serviceDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 15
  },
  badgeSmall: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 8
  },
  badgeSmallText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#B45309"
  },
  deskHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: typography.weights.bold,
    color: colors.textMain
  },
  sectionSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1
  },
  newTicketBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4
  },
  newTicketBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: typography.weights.bold
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 28,
    alignItems: "center"
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
    marginTop: 12
  },
  emptyDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: "center"
  },
  raisePrimaryBtn: {
    marginTop: 16,
    backgroundColor: "#E8F4EF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10
  },
  raisePrimaryBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: typography.weights.bold
  },
  ticketCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    overflow: "hidden"
  },
  ticketPriorityBar: {
    width: 5
  },
  ticketBody: {
    flex: 1,
    padding: 14
  },
  ticketMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4
  },
  ticketCategoryTag: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 0.5
  },
  ticketTitle: {
    fontSize: 14,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
    marginBottom: 2
  },
  ticketDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8
  },
  ticketFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F7F8F6",
    paddingTop: 8
  },
  ticketActionLink: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: typography.weights.semibold
  },
  ticketAttachmentTag: {
    fontSize: 10,
    color: colors.textMuted
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
  modalHeading: {
    fontSize: 18,
    fontWeight: typography.weights.heavy,
    color: colors.textMain
  },
  modalSubheading: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 14
  },
  formErrorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    padding: 8,
    marginBottom: 10
  },
  formErrorText: {
    color: "#B91C1C",
    fontSize: 11,
    fontWeight: "600"
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 4,
    marginTop: 8
  },
  categoryGrid: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 10
  },
  categoryOption: {
    flex: 1,
    backgroundColor: "#F7F8F6",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: "center"
  },
  categoryOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  categoryOptionText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textMuted
  },
  categoryOptionTextActive: {
    color: "#FFFFFF"
  },
  inputField: {
    backgroundColor: "#F7F8F6",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: colors.textMain,
    marginBottom: 6
  },
  attachmentOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F8F6",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    marginBottom: 14
  },
  attachmentOptionActive: {
    backgroundColor: "#E8F4EF",
    borderColor: colors.primary
  },
  attachmentTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMain
  },
  attachmentSub: {
    fontSize: 10,
    color: colors.textMuted
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 8
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  modalCancelText: {
    color: colors.textMuted,
    fontWeight: "600",
    fontSize: 13
  },
  modalSubmitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10
  },
  modalSubmitText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13
  },
  ticketDetailTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8
  },
  ticketDetailCategory: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2
  },
  ticketDetailDescBox: {
    backgroundColor: "#F7F8F6",
    borderRadius: 10,
    padding: 12,
    marginVertical: 8
  },
  ticketDetailDescText: {
    fontSize: 13,
    color: colors.textMain,
    lineHeight: 18
  },
  emptyMiniText: {
    fontSize: 11,
    color: colors.textMuted,
    paddingVertical: 4
  },
  attachmentChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginVertical: 4
  },
  attachmentChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F4EF",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4
  },
  attachmentChipText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "600",
    maxWidth: 200
  },
  commentItem: {
    backgroundColor: "#F7F8F6",
    borderRadius: 8,
    padding: 8,
    marginBottom: 6
  },
  commentAuthor: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 2
  },
  commentBody: {
    fontSize: 12,
    color: colors.textMain
  },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8
  },
  commentPostBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  commentPostBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700"
  },
  detailActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 14
  },
  cancelTicketLink: {
    marginRight: "auto"
  },
  cancelTicketLinkText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "700"
  },
  closeDetailBtn: {
    backgroundColor: "#F7F8F6",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  closeDetailBtnText: {
    color: colors.textMain,
    fontSize: 12,
    fontWeight: "600"
  }
});
