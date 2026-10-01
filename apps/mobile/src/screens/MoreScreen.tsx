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
  Alert
} from "react-native";
import { colors, ThemeTone } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { IconBox } from "../components/IconBox";
import { StatusPill } from "../components/StatusPill";
import {
  AuthUser,
  UnitSummary,
  Amenity,
  AmenityBooking,
  Due,
  HouseholdMember,
  Vehicle,
  ParkingSlot,
  Document,
  VehicleType
} from "@apartment/shared";
import { mobileApiClient } from "../services/api-client";

interface ModuleGridItem {
  id: string;
  title: string;
  subtitle: string;
  symbol: string;
  tone: ThemeTone;
}

const allModules: ModuleGridItem[] = [
  { id: "household", title: "Household Members", subtitle: "Family & Occupants", symbol: "👨‍👩‍👧‍👦", tone: "blue" },
  { id: "vehicles", title: "Vehicles & Parking", subtitle: "Slots & Registrations", symbol: "🚗", tone: "green" },
  { id: "documents", title: "Bylaws & Documents", subtitle: "Rules & Compliance", symbol: "📁", tone: "violet" },
  { id: "payments", title: "Payments & Dues", subtitle: "Maintenance Invoices", symbol: "💳", tone: "green" },
  { id: "amenities", title: "Amenities Booking", subtitle: "Hall, Courts, Pool", symbol: "🏊", tone: "blue" },
  { id: "residents", title: "Residents Directory", subtitle: "Society Directory", symbol: "👥", tone: "blue" },
  { id: "rentals", title: "Rental Management", subtitle: "Lease Verification", symbol: "📋", tone: "violet" },
  { id: "maintenance", title: "Maintenance Desk", subtitle: "Service Requests", symbol: "🔧", tone: "orange" },
  { id: "visitors", title: "Gate Passes", subtitle: "Digital Entry Pass", symbol: "🛡️", tone: "blue" },
  { id: "cctv", title: "CCTV & Security", subtitle: "Gate Surveillance", symbol: "📹", tone: "red" },
  { id: "chat", title: "Helpdesk Chat", subtitle: "Security & Management", symbol: "💬", tone: "violet" },
  { id: "notices", title: "Notices & Circulars", subtitle: "Official Broadcasts", symbol: "📢", tone: "orange" }
];

interface MoreScreenProps {
  currentUser?: AuthUser | null;
  currentUnit?: UnitSummary | null;
  onLogout?: () => void;
  onNavigateTab?: (tab: "services" | "chat" | "visitors" | "more") => void;
}

export function MoreScreen({ currentUser, currentUnit, onLogout, onNavigateTab }: MoreScreenProps) {
  const [profile, setProfile] = useState<AuthUser | null>(currentUser || null);

  // Edit Profile Modal State
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [editName, setEditName] = useState(currentUser?.fullName || "");
  const [editPhone, setEditPhone] = useState(currentUser?.phoneNumber || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Amenities Modal State
  const [amenitiesModalVisible, setAmenitiesModalVisible] = useState(false);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loadingAmenities, setLoadingAmenities] = useState(false);
  const [bookingAmenityId, setBookingAmenityId] = useState<string | null>(null);

  // Dues Modal State
  const [duesModalVisible, setDuesModalVisible] = useState(false);
  const [dues, setDues] = useState<Due[]>([]);
  const [loadingDues, setLoadingDues] = useState(false);

  // Household Members State
  const [householdModalVisible, setHouseholdModalVisible] = useState(false);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [loadingHousehold, setLoadingHousehold] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRelation, setNewMemberRelation] = useState("SPOUSE");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  // Vehicles & Parking State
  const [vehiclesModalVisible, setVehiclesModalVisible] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [parkingSlot, setParkingSlot] = useState<ParkingSlot | null>(null);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [newRegNumber, setNewRegNumber] = useState("");
  const [newVehType, setNewVehType] = useState<VehicleType>("FOUR_WHEELER");
  const [newMakeModel, setNewMakeModel] = useState("");
  const [newIsEv, setNewIsEv] = useState(false);
  const [addingVehicle, setAddingVehicle] = useState(false);

  // Documents State
  const [documentsModalVisible, setDocumentsModalVisible] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfile(currentUser);
      setEditName(currentUser.fullName);
      setEditPhone(currentUser.phoneNumber || "");
    }
  }, [currentUser]);

  const handleOpenEditProfile = () => {
    setEditName(profile?.fullName || "");
    setEditPhone(profile?.phoneNumber || "");
    setProfileModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim() || editName.length < 2) {
      Alert.alert("Invalid Input", "Full Name must be at least 2 characters.");
      return;
    }
    setSavingProfile(true);
    try {
      const updated = await mobileApiClient.updateProfile({
        fullName: editName.trim(),
        phoneNumber: editPhone.trim()
      });
      setProfile(updated);
      setProfileModalVisible(false);
      Alert.alert("Profile Updated", "Your profile details have been saved.");
    } catch (err: any) {
      Alert.alert("Update Failed", err.message || "Could not update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleOpenAmenities = async () => {
    setAmenitiesModalVisible(true);
    setLoadingAmenities(true);
    try {
      const data = await mobileApiClient.getAmenities();
      setAmenities(data);
    } catch {
      // Graceful error
    } finally {
      setLoadingAmenities(false);
    }
  };

  const handleBookAmenity = async (amenity: Amenity) => {
    setBookingAmenityId(amenity.id);
    try {
      const startTime = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      const endTime = new Date(Date.now() + 26 * 3600 * 1000).toISOString();
      await mobileApiClient.bookAmenity(amenity.id, startTime, endTime);
      Alert.alert(
        "Booking Confirmed",
        `Your reservation for ${amenity.name} for tomorrow has been confirmed.`
      );
    } catch (err: any) {
      Alert.alert("Booking Failed", err.message || "Could not complete reservation.");
    } finally {
      setBookingAmenityId(null);
    }
  };

  const handleOpenDues = async () => {
    setDuesModalVisible(true);
    setLoadingDues(true);
    try {
      const data = await mobileApiClient.getDues();
      setDues(data);
    } catch {
      // Graceful error
    } finally {
      setLoadingDues(false);
    }
  };

  const handlePayDue = async (due: Due) => {
    try {
      const updated = await mobileApiClient.recordDuePayment(due.id);
      setDues((prev) => prev.map((d) => (d.id === due.id ? updated : d)));
      Alert.alert("Payment Recorded", `Payment of ₹${due.amount} marked as PAID.`);
    } catch (err: any) {
      Alert.alert("Payment Failed", err.message || "Could not record payment.");
    }
  };

  // Household Handlers
  const handleOpenHousehold = async () => {
    setHouseholdModalVisible(true);
    setLoadingHousehold(true);
    try {
      const list = await mobileApiClient.getHouseholdMembers();
      setHouseholdMembers(list);
    } catch {
      // Handled
    } finally {
      setLoadingHousehold(false);
    }
  };

  const handleAddHouseholdMember = async () => {
    if (!newMemberName.trim()) {
      Alert.alert("Invalid Input", "Member name is required.");
      return;
    }
    setAddingMember(true);
    try {
      const added = await mobileApiClient.addHouseholdMember({
        fullName: newMemberName.trim(),
        relationship: newMemberRelation,
        phoneNumber: newMemberPhone.trim() || undefined
      });
      setHouseholdMembers((prev) => [...prev, added]);
      setNewMemberName("");
      setNewMemberPhone("");
      Alert.alert("Member Added", `${added.fullName} added to your household.`);
    } catch (err: any) {
      Alert.alert("Failed", err.message || "Could not add household member.");
    } finally {
      setAddingMember(false);
    }
  };

  const handleDeleteHouseholdMember = (id: string, name: string) => {
    Alert.alert("Remove Member", `Remove ${name} from your household?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await mobileApiClient.deleteHouseholdMember(id);
            setHouseholdMembers((prev) => prev.filter((m) => m.id !== id));
          } catch (err: any) {
            Alert.alert("Error", err.message || "Could not remove member.");
          }
        }
      }
    ]);
  };

  // Vehicles & Parking Handlers
  const handleOpenVehicles = async () => {
    setVehiclesModalVisible(true);
    setLoadingVehicles(true);
    try {
      const [vList, pSlot] = await Promise.all([
        mobileApiClient.getVehicles(),
        mobileApiClient.getMyParking()
      ]);
      setVehicles(vList);
      setParkingSlot(pSlot);
    } catch {
      // Handled
    } finally {
      setLoadingVehicles(false);
    }
  };

  const handleAddVehicle = async () => {
    if (!newRegNumber.trim()) {
      Alert.alert("Invalid Input", "License plate is required.");
      return;
    }
    setAddingVehicle(true);
    try {
      const added = await mobileApiClient.addVehicle({
        vehicleNumber: newRegNumber.trim().toUpperCase(),
        vehicleType: newIsEv ? "EV" : newVehType,
        makeModel: newMakeModel.trim() || undefined
      });
      setVehicles((prev) => [...prev, added]);
      setNewRegNumber("");
      setNewMakeModel("");
      setNewIsEv(false);
      Alert.alert("Vehicle Registered", `${added.vehicleNumber} registered successfully.`);
    } catch (err: any) {
      Alert.alert("Failed", err.message || "Could not register vehicle.");
    } finally {
      setAddingVehicle(false);
    }
  };

  const handleDeleteVehicle = (id: string, plate: string) => {
    Alert.alert("De-register Vehicle", `Remove ${plate}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await mobileApiClient.deleteVehicle(id);
            setVehicles((prev) => prev.filter((v) => v.id !== id));
          } catch (err: any) {
            Alert.alert("Error", err.message || "Could not remove vehicle.");
          }
        }
      }
    ]);
  };

  // Documents Handlers
  const handleOpenDocuments = async () => {
    setDocumentsModalVisible(true);
    setLoadingDocuments(true);
    try {
      const docs = await mobileApiClient.getDocuments();
      setDocuments(docs);
    } catch {
      // Handled
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleModulePress = (moduleId: string) => {
    if (moduleId === "household") {
      handleOpenHousehold();
    } else if (moduleId === "vehicles") {
      handleOpenVehicles();
    } else if (moduleId === "documents") {
      handleOpenDocuments();
    } else if (moduleId === "amenities") {
      handleOpenAmenities();
    } else if (moduleId === "payments") {
      handleOpenDues();
    } else if (moduleId === "visitors" && onNavigateTab) {
      onNavigateTab("visitors");
    } else if (moduleId === "maintenance" && onNavigateTab) {
      onNavigateTab("services");
    } else if (moduleId === "chat" && onNavigateTab) {
      onNavigateTab("chat");
    } else {
      Alert.alert(
        "Service Information",
        `Module: ${moduleId.toUpperCase()}\nFor updates or inquiries, contact building administration.`
      );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Resident Profile Card */}
        {profile && (
          <TouchableOpacity
            style={styles.profileCard}
            onPress={handleOpenEditProfile}
            activeOpacity={0.8}
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : "R"}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.fullName}</Text>
              <Text style={styles.profileEmail}>{profile.email}</Text>
              <Text style={styles.profilePhone}>{profile.phoneNumber || "+91 91234 56789"}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {currentUnit ? `${currentUnit.block} - ${currentUnit.unitNumber}` : "Tower A - 402"} • {profile.role}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 18, color: colors.textMuted }}>✏️</Text>
          </TouchableOpacity>
        )}

        {/* Logout Action Button */}
        {onLogout && (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={onLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Sign Out of My Account</Text>
          </TouchableOpacity>
        )}

        <View style={styles.header}>
          <Text style={styles.pageHeading}>Community Services</Text>
          <Text style={styles.pageSubheading}>Tap any service to manage facilities, payments, and desks</Text>
        </View>

        <View style={styles.grid}>
          {allModules.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.moduleCard}
              onPress={() => handleModulePress(item.id)}
              activeOpacity={0.7}
            >
              <IconBox symbol={item.symbol} tone={item.tone} size={42} />
              <Text style={styles.moduleTitle}>{item.title}</Text>
              <Text style={styles.moduleSubtitle}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={profileModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Resident Profile</Text>
            <Text style={styles.modalSubtitle}>Update your verified contact information</Text>

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.textInput}
              value={editName}
              onChangeText={setEditName}
            />

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.textInput}
              value={editPhone}
              onChangeText={setEditPhone}
              keyboardType="phone-pad"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setProfileModalVisible(false)}
                disabled={savingProfile}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSaveProfile}
                disabled={savingProfile}
              >
                {savingProfile ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Amenities Modal */}
      <Modal visible={amenitiesModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "85%" }]}>
            <Text style={styles.modalTitle}>Shared Amenities</Text>
            <Text style={styles.modalSubtitle}>Book clubhouses, courts, and facilities</Text>

            {loadingAmenities ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
            ) : (
              <ScrollView style={{ maxHeight: 350 }}>
                {amenities.map((amenity) => (
                  <View key={amenity.id} style={styles.amenityCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.amenityName}>{amenity.name}</Text>
                      <Text style={styles.amenityDesc}>{amenity.description}</Text>
                      <Text style={styles.amenityMeta}>
                        Capacity: {amenity.capacity} • Hours: {amenity.openTime} - {amenity.closeTime}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.bookBtn}
                      onPress={() => handleBookAmenity(amenity)}
                      disabled={bookingAmenityId === amenity.id}
                    >
                      {bookingAmenityId === amenity.id ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.bookBtnText}>Book Slot</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={[styles.modalActions, { marginTop: spacing.md }]}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setAmenitiesModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Dues & Payments Modal */}
      <Modal visible={duesModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "85%" }]}>
            <Text style={styles.modalTitle}>Maintenance Invoices & Dues</Text>
            <Text style={styles.modalSubtitle}>Unit 402 • Financial Ledger</Text>

            {loadingDues ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
            ) : dues.length === 0 ? (
              <Text style={{ color: colors.textMuted, paddingVertical: 16 }}>No pending dues found.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 350 }}>
                {dues.map((due) => (
                  <View key={due.id} style={styles.dueCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dueTitle}>{due.title}</Text>
                      <Text style={styles.dueAmount}>₹{due.amount.toLocaleString()}</Text>
                      <Text style={styles.dueMeta}>Due by: {due.dueDate}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <StatusPill
                        label={due.status}
                        tone={due.status === "PAID" ? "green" : "orange"}
                      />
                      {due.status !== "PAID" && (
                        <TouchableOpacity
                          style={styles.payBtn}
                          onPress={() => handlePayDue(due)}
                        >
                          <Text style={styles.payBtnText}>Record Payment</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={[styles.modalActions, { marginTop: spacing.md }]}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setDuesModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Household Members Modal */}
      <Modal visible={householdModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "88%" }]}>
            <Text style={styles.modalTitle}>Household Members</Text>
            <Text style={styles.modalSubtitle}>Family members & co-occupants registered to your unit</Text>

            {/* Add Member Subform */}
            <View style={styles.subformCard}>
              <Text style={styles.subformTitle}>Add New Member</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Full Name (e.g. Priya Sharma)"
                placeholderTextColor={colors.textMuted}
                value={newMemberName}
                onChangeText={setNewMemberName}
              />
              <View style={{ flexDirection: "row", gap: 8, marginVertical: 4 }}>
                <TextInput
                  style={[styles.formInput, { flex: 1 }]}
                  placeholder="Relationship (SPOUSE, CHILD, etc)"
                  placeholderTextColor={colors.textMuted}
                  value={newMemberRelation}
                  onChangeText={setNewMemberRelation}
                />
                <TextInput
                  style={[styles.formInput, { flex: 1 }]}
                  placeholder="Phone Number (optional)"
                  placeholderTextColor={colors.textMuted}
                  value={newMemberPhone}
                  onChangeText={setNewMemberPhone}
                  keyboardType="phone-pad"
                />
              </View>
              <TouchableOpacity
                style={styles.addSubformBtn}
                onPress={handleAddHouseholdMember}
                disabled={addingMember}
              >
                {addingMember ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.addSubformBtnText}>+ Add Household Member</Text>
                )}
              </TouchableOpacity>
            </View>

            {loadingHousehold ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
            ) : householdMembers.length === 0 ? (
              <Text style={{ color: colors.textMuted, paddingVertical: 16, textAlign: "center" }}>
                No additional household members registered.
              </Text>
            ) : (
              <ScrollView style={{ maxHeight: 220, marginTop: 8 }}>
                {householdMembers.map((m) => (
                  <View key={m.id} style={styles.recordCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recordTitle}>{m.fullName}</Text>
                      <Text style={styles.recordSubtitle}>
                        {m.relationship} {m.phoneNumber ? `• ${m.phoneNumber}` : ""}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteHouseholdMember(m.id, m.fullName)}
                      style={styles.deleteBtn}
                    >
                      <Text style={styles.deleteBtnText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={[styles.modalActions, { marginTop: spacing.md }]}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setHouseholdModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Vehicles & Parking Modal */}
      <Modal visible={vehiclesModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "88%" }]}>
            <Text style={styles.modalTitle}>Vehicles & Parking</Text>
            <Text style={styles.modalSubtitle}>Registered vehicles and allocated parking bay</Text>

            {/* Parking Bay Info Banner */}
            <View style={styles.parkingSlotBanner}>
              <Text style={{ fontSize: 20 }}>🅿️</Text>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.parkingSlotTitle}>
                  {parkingSlot ? `Allocated Bay: Slot ${parkingSlot.slotNumber} (${parkingSlot.levelLocation})` : "No Parking Bay Allocated"}
                </Text>
                <Text style={styles.parkingSlotSub}>
                  {parkingSlot ? `Bay ${parkingSlot.slotNumber} assigned to your unit` : "Contact community management to request a parking assignment."}
                </Text>
              </View>
            </View>

            {/* Register Vehicle Subform */}
            <View style={styles.subformCard}>
              <Text style={styles.subformTitle}>Register New Vehicle</Text>
              <TextInput
                style={styles.formInput}
                placeholder="License Plate (e.g. MH 12 AB 1234)"
                placeholderTextColor={colors.textMuted}
                value={newRegNumber}
                onChangeText={setNewRegNumber}
                autoCapitalize="characters"
              />
              <View style={{ flexDirection: "row", gap: 8, marginVertical: 4 }}>
                <TextInput
                  style={[styles.formInput, { flex: 1 }]}
                  placeholder="Make & Model (e.g. Honda City)"
                  placeholderTextColor={colors.textMuted}
                  value={newMakeModel}
                  onChangeText={setNewMakeModel}
                />
                <TouchableOpacity
                  style={[styles.vehTypeToggle, newVehType === "TWO_WHEELER" && styles.vehTypeToggleActive]}
                  onPress={() => setNewVehType(newVehType === "TWO_WHEELER" ? "FOUR_WHEELER" : "TWO_WHEELER")}
                >
                  <Text style={[styles.vehTypeToggleText, newVehType === "TWO_WHEELER" && styles.vehTypeToggleTextActive]}>
                    {newVehType === "TWO_WHEELER" ? "🏍️ 2-Wheeler" : "🚗 4-Wheeler"}
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", marginVertical: 4 }}
                onPress={() => setNewIsEv(!newIsEv)}
              >
                <Text style={{ fontSize: 14 }}>{newIsEv ? "☑️" : "⬜"}</Text>
                <Text style={{ fontSize: 12, color: colors.textMain, marginLeft: 6, fontWeight: "600" }}>
                  Electric Vehicle (EV)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addSubformBtn}
                onPress={handleAddVehicle}
                disabled={addingVehicle}
              >
                {addingVehicle ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.addSubformBtnText}>+ Register Vehicle</Text>
                )}
              </TouchableOpacity>
            </View>

            {loadingVehicles ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
            ) : vehicles.length === 0 ? (
              <Text style={{ color: colors.textMuted, paddingVertical: 16, textAlign: "center" }}>
                No vehicles registered. Add your vehicle above.
              </Text>
            ) : (
              <ScrollView style={{ maxHeight: 180, marginTop: 8 }}>
                {vehicles.map((v) => (
                  <View key={v.id} style={styles.recordCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recordTitle}>
                        {v.vehicleNumber} {v.vehicleType === "EV" ? "⚡ (EV)" : ""}
                      </Text>
                      <Text style={styles.recordSubtitle}>
                        {v.vehicleType} {v.makeModel ? `• ${v.makeModel}` : ""}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteVehicle(v.id, v.vehicleNumber)}
                      style={styles.deleteBtn}
                    >
                      <Text style={styles.deleteBtnText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={[styles.modalActions, { marginTop: spacing.md }]}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setVehiclesModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Documents & Bylaws Modal */}
      <Modal visible={documentsModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "88%" }]}>
            <Text style={styles.modalTitle}>Documents & Bylaws</Text>
            <Text style={styles.modalSubtitle}>Statutory compliance, audit reports, AMC & society guidelines</Text>

            {loadingDocuments ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
            ) : documents.length === 0 ? (
              <Text style={{ color: colors.textMuted, paddingVertical: 24, textAlign: "center" }}>
                No documents currently available for your access level.
              </Text>
            ) : (
              <ScrollView style={{ maxHeight: 380, marginTop: 12 }}>
                {documents.map((doc) => (
                  <View key={doc.id} style={styles.docCard}>
                    <Text style={{ fontSize: 24 }}>📄</Text>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <Text style={styles.docCategory}>{doc.category.replace(/_/g, " ")}</Text>
                        <Text style={styles.docAccessBadge}>{doc.accessLevel}</Text>
                      </View>
                      <Text style={styles.docTitle}>{doc.title}</Text>
                      {doc.description && <Text style={styles.docDesc}>{doc.description}</Text>}
                      <Text style={styles.docMeta}>
                        Uploaded: {new Date(doc.createdAt).toLocaleDateString()} • {(doc.fileSize / 1024).toFixed(0)} KB
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={[styles.modalActions, { marginTop: spacing.md }]}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setDocumentsModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Close</Text>
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
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgSurface,
    borderRadius: spacing.radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3b82f620",
    borderWidth: 1,
    borderColor: "#3b82f650",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3b82f6"
  },
  profileInfo: {
    flex: 1
  },
  profileName: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.textMain
  },
  profileEmail: {
    fontSize: typography.sizes.caption,
    color: colors.textMuted,
    marginTop: 1
  },
  profilePhone: {
    fontSize: typography.sizes.tiny,
    color: colors.textMuted,
    marginTop: 1
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#10b98120",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4
  },
  roleText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#10b981"
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef444415",
    borderWidth: 1,
    borderColor: "#ef444440",
    borderRadius: spacing.radius.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.lg
  },
  logoutIcon: {
    fontSize: 16,
    marginRight: spacing.sm
  },
  logoutText: {
    color: "#ef4444",
    fontWeight: "700",
    fontSize: 14
  },
  header: {
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  moduleCard: {
    width: "48%",
    backgroundColor: colors.bgSurface,
    borderRadius: spacing.radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  moduleTitle: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
    marginTop: spacing.sm,
    textAlign: "center"
  },
  moduleSubtitle: {
    fontSize: typography.sizes.tiny,
    color: colors.textMuted,
    marginTop: 2,
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
    marginBottom: spacing.md
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
  },
  amenityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgPage,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 8
  },
  amenityName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMain
  },
  amenityDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginVertical: 2
  },
  amenityMeta: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "600"
  },
  bookBtn: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8
  },
  bookBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700"
  },
  dueCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgPage,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 8
  },
  dueTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMain
  },
  dueAmount: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textMain,
    marginVertical: 2
  },
  dueMeta: {
    fontSize: 11,
    color: colors.textMuted
  },
  payBtn: {
    backgroundColor: colors.success,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 6
  },
  payBtnText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700"
  },
  subformCard: {
    backgroundColor: colors.bgPage,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    marginTop: 8
  },
  subformTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMain,
    marginBottom: 6
  },
  formInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: colors.textMain
  },
  addSubformBtn: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center",
    marginTop: 6
  },
  addSubformBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700"
  },
  recordCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgPage,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    marginBottom: 6
  },
  recordTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMain
  },
  recordSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2
  },
  deleteBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#fee2e2",
    borderRadius: 4
  },
  deleteBtnText: {
    color: "#b91c1c",
    fontSize: 11,
    fontWeight: "700"
  },
  parkingSlotBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    padding: 10,
    marginTop: 8
  },
  parkingSlotTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e40af"
  },
  parkingSlotSub: {
    fontSize: 11,
    color: "#3b82f6",
    marginTop: 2
  },
  vehTypeToggle: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6
  },
  vehTypeToggleActive: {
    backgroundColor: "#dbeafe",
    borderColor: colors.primary
  },
  vehTypeToggleText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted
  },
  vehTypeToggleTextActive: {
    color: colors.primary,
    fontWeight: "700"
  },
  docCard: {
    flexDirection: "row",
    backgroundColor: colors.bgPage,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    marginBottom: 8
  },
  docCategory: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 0.5
  },
  docAccessBadge: {
    fontSize: 9,
    fontWeight: "700",
    color: "#059669",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  docTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMain,
    marginTop: 2
  },
  docDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginVertical: 2
  },
  docMeta: {
    fontSize: 10,
    color: colors.textMuted
  }
});
