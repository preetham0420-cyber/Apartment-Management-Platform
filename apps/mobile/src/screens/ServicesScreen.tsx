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

export function ServicesScreen() {
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

      // If user selected to attach defect proof photo, simulate uploading defect picture
      if (attachDefectPhoto) {
        try {
          // Standard 1x1 png base64 for defect photo upload simulation
          const samplePngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
          await mobileApiClient.uploadMaintenanceAttachment(
            newTicket.id,
            "leak_defect_photo.png",
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
      Alert.alert("Request Raised", "Your maintenance ticket and attachments have been logged.");
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

  const getStatusTone = (s: string): "blue" | "green" | "orange" | "red" => {
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
        return "blue";
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Header CTA */}
        <View style={styles.actionHeader}>
          <View>
            <Text style={styles.pageHeading}>Maintenance Desk</Text>
            <Text style={styles.pageSubheading}>Track active tickets and submit new requests</Text>
          </View>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setCreateModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.createButtonText}>+ New</Text>
          </TouchableOpacity>
        </View>

        {/* Tickets List */}
        <Text style={styles.sectionTitle}>Active Service Requests</Text>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
        ) : tickets.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No active maintenance requests.</Text>
            <Text style={styles.emptySubtext}>Tap "+ New" if your unit requires plumbing, electrical, or carpentry service.</Text>
          </View>
        ) : (
          tickets.map((ticket) => (
            <TouchableOpacity
              key={ticket.id}
              style={styles.ticketCard}
              onPress={() => setSelectedTicket(ticket)}
              activeOpacity={0.85}
            >
              <View style={[styles.priorityLine, { backgroundColor: getPriorityColor(ticket.priority) }]} />
              <View style={styles.ticketContent}>
                <View style={styles.ticketTopRow}>
                  <Text style={styles.ticketId}>
                    {ticket.category} • {ticket.priority}
                  </Text>
                  <StatusPill label={ticket.status} tone={getStatusTone(ticket.status)} />
                </View>
                <Text style={styles.ticketTitle}>{ticket.title}</Text>
                <Text style={styles.ticketLocation} numberOfLines={2}>
                  {ticket.description}
                </Text>

                <View style={styles.assigneeRow}>
                  <Text style={styles.assigneeLabel}>Tap to view comments & details &rarr;</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Raise New Request Modal */}
      <Modal visible={createModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Raise Service Request</Text>
            <Text style={styles.modalSubtitle}>Unit 402, Tower A • Facility Management</Text>

            {formError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            )}

            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoryRow}>
              {(["PLUMBING", "ELECTRICAL", "CARPENTRY", "APPLIANCE"] as MaintenanceCategory[]).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryBtn, category === cat && styles.categoryBtnActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.categoryBtnText, category === cat && styles.categoryBtnTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Issue Title</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Water leak under bathroom sink"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.inputLabel}>Detailed Description</Text>
            <TextInput
              style={[styles.textInput, { height: 70, textAlignVertical: "top" }]}
              placeholder="Describe the issue, urgency, and convenient inspection time..."
              placeholderTextColor={colors.textMuted}
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.inputLabel}>Priority Level</Text>
            <View style={styles.categoryRow}>
              {(["LOW", "MEDIUM", "HIGH", "EMERGENCY"] as MaintenancePriority[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.categoryBtn, priority === p && styles.categoryBtnActive]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={[styles.categoryBtnText, priority === p && styles.categoryBtnTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.attachmentBox,
                attachDefectPhoto && styles.attachmentBoxActive
              ]}
              onPress={() => setAttachDefectPhoto(!attachDefectPhoto)}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 16 }}>{attachDefectPhoto ? "✅" : "📎"}</Text>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.attachmentLabel}>
                  {attachDefectPhoto ? "Defect Photo Attached (1 file)" : "Attach Defect Photo / Bill (Optional)"}
                </Text>
                <Text style={styles.attachmentHint}>Strictly PNG, JPEG, or PDF under 5MB</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setCreateModalVisible(false)}
                disabled={submitting}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleCreateRequest}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Request</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Ticket Details & Comments Modal */}
      <Modal visible={Boolean(selectedTicket)} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "85%" }]}>
            {selectedTicket && (
              <>
                <View style={styles.detailHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitle}>{selectedTicket.title}</Text>
                    <Text style={styles.modalSubtitle}>
                      {selectedTicket.category} • Priority: {selectedTicket.priority}
                    </Text>
                  </View>
                  <StatusPill label={selectedTicket.status} tone={getStatusTone(selectedTicket.status)} />
                </View>

                <Text style={styles.descText}>{selectedTicket.description}</Text>

                {/* Attachments Section */}
                <Text style={[styles.sectionTitle, { marginTop: spacing.sm, marginBottom: spacing.xs }]}>
                  Attachments & Evidence ({selectedTicket.attachments?.length || 0})
                </Text>
                {(!selectedTicket.attachments || selectedTicket.attachments.length === 0) ? (
                  <Text style={{ color: colors.textMuted, fontSize: 12, paddingVertical: 4 }}>
                    No defect files or photos attached.
                  </Text>
                ) : (
                  <View style={styles.attachmentsRow}>
                    {selectedTicket.attachments.map((att) => (
                      <View key={att.id} style={styles.attachmentChip}>
                        <Text style={{ fontSize: 12 }}>📄</Text>
                        <Text style={styles.attachmentChipText} numberOfLines={1}>
                          {att.fileName} ({(att.fileSize / 1024).toFixed(1)} KB)
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                <Text style={[styles.sectionTitle, { marginTop: spacing.md, marginBottom: spacing.xs }]}>
                  Comments & Updates
                </Text>
                <ScrollView style={{ maxHeight: 150 }}>
                  {!selectedTicket.comments || selectedTicket.comments.length === 0 ? (
                    <Text style={{ color: colors.textMuted, fontSize: 12, paddingVertical: 8 }}>
                      No comments yet. Technicians will post updates here.
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
                      style={[styles.textInput, { flex: 1, marginRight: 8 }]}
                      placeholder="Add note or question..."
                      placeholderTextColor={colors.textMuted}
                      value={commentText}
                      onChangeText={setCommentText}
                    />
                    <TouchableOpacity
                      style={[styles.submitBtn, { paddingHorizontal: 12 }]}
                      onPress={handleAddComment}
                      disabled={submittingComment}
                    >
                      {submittingComment ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.submitBtnText}>Post</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                <View style={[styles.modalActions, { marginTop: spacing.md }]}>
                  {selectedTicket.status !== "CANCELLED" && selectedTicket.status !== "CLOSED" && (
                    <TouchableOpacity
                      style={[styles.cancelBtn, { marginRight: "auto" }]}
                      onPress={() => handleCancelTicket(selectedTicket.id)}
                    >
                      <Text style={{ color: colors.danger, fontWeight: "700" }}>Cancel Ticket</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setSelectedTicket(null)}
                  >
                    <Text style={styles.cancelBtnText}>Close</Text>
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
    paddingBottom: spacing.xxl
  },
  actionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.radius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2
  },
  createButtonText: {
    color: "#fff",
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.bold
  },
  sectionTitle: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
    marginBottom: spacing.sm
  },
  ticketCard: {
    flexDirection: "row",
    backgroundColor: colors.bgSurface,
    borderRadius: spacing.radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    overflow: "hidden"
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
    color: colors.textMuted,
    marginBottom: spacing.sm
  },
  assigneeRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  assigneeLabel: {
    fontSize: typography.sizes.tiny,
    color: colors.primary,
    fontWeight: "600"
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
    marginTop: 4,
    textAlign: "center"
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
    marginBottom: spacing.sm
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xs
  },
  descText: {
    fontSize: 13,
    color: colors.textMain,
    backgroundColor: colors.bgPage,
    borderRadius: 8,
    padding: 10,
    marginVertical: 6
  },
  commentItem: {
    backgroundColor: colors.bgPage,
    borderRadius: 8,
    padding: 8,
    marginBottom: 6
  },
  commentAuthor: {
    fontSize: 11,
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
    marginTop: spacing.sm
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    padding: 8,
    marginBottom: spacing.sm
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
    marginTop: 6
  },
  textInput: {
    backgroundColor: colors.bgPage,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.textMain
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4
  },
  categoryBtn: {
    flex: 1,
    backgroundColor: colors.bgPage,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingVertical: 6,
    marginHorizontal: 2,
    alignItems: "center"
  },
  categoryBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  categoryBtnText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textMuted
  },
  categoryBtnTextActive: {
    color: "#fff"
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: spacing.md
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8
  },
  cancelBtnText: {
    color: colors.textMuted,
    fontWeight: "600"
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 8
  },
  submitBtnText: {
    color: "#fff",
    fontWeight: "700"
  },
  attachmentBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgPage,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    marginTop: 10
  },
  attachmentBoxActive: {
    borderColor: colors.primary,
    backgroundColor: "#eff6ff"
  },
  attachmentLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMain
  },
  attachmentHint: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2
  },
  attachmentsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginVertical: 4
  },
  attachmentChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4
  },
  attachmentChipText: {
    fontSize: 11,
    color: colors.textMain,
    fontWeight: "600",
    maxWidth: 200
  }
});
