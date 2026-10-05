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
  { id: "notices", title: "Notices & Circulars", subtitle: "Official Broadcasts", symbol: "📢", tone: "orange" },
  { id: "notifications", title: "In-App Alerts", subtitle: "Inbox & Updates", symbol: "🔔", tone: "blue" }
];

interface MoreScreenProps {
  currentUser?: AuthUser | null;
  currentUnit?: UnitSummary | null;
  onLogout?: () => void;
  onNavigateTab?: (tab: "services" | "chat" | "visitors" | "more") => void;
  onOpenNotifications?: () => void;
}

export function MoreScreen({ currentUser, currentUnit, onLogout, onNavigateTab, onOpenNotifications }: MoreScreenProps) {
  const [profile, setProfile] = useState<AuthUser | null>(currentUser || null);

  // Edit Profile Modal State
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [editName, setEditName] = useState(currentUser?.fullName || "");
  const [editPhone, setEditPhone] = useState(currentUser?.phoneNumber || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Helper types and slots for Amenities Booking
  const AMENITY_TIME_SLOTS = [
    { id: "slot-07-09", label: "07:00 AM - 09:00 AM", startHour: 7, startMin: 0, endHour: 9, endMin: 0, period: "Morning" },
    { id: "slot-09-11", label: "09:00 AM - 11:00 AM", startHour: 9, startMin: 0, endHour: 11, endMin: 0, period: "Morning" },
    { id: "slot-11-13", label: "11:00 AM - 01:00 PM", startHour: 11, startMin: 0, endHour: 13, endMin: 0, period: "Afternoon" },
    { id: "slot-14-16", label: "02:00 PM - 04:00 PM", startHour: 14, startMin: 0, endHour: 16, endMin: 0, period: "Afternoon" },
    { id: "slot-16-18", label: "04:00 PM - 06:00 PM", startHour: 16, startMin: 0, endHour: 18, endMin: 0, period: "Evening" },
    { id: "slot-18-20", label: "06:00 PM - 08:00 PM", startHour: 18, startMin: 0, endHour: 20, endMin: 0, period: "Evening" },
    { id: "slot-20-22", label: "08:00 PM - 10:00 PM", startHour: 20, startMin: 0, endHour: 22, endMin: 0, period: "Evening" }
  ];

  const getTomorrowDateStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const getAvailableBookingDates = () => {
    const list = [];
    const days = ["Today", "Tomorrow", "Day After"];
    for (let i = 0; i < 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const month = d.toLocaleString("en-US", { month: "short" });
      const day = d.getDate();
      list.push({
        dateStr,
        label: `${days[i]} (${month} ${day})`,
        dayName: days[i]
      });
    }
    return list;
  };

  // Amenities Modal State
  const [amenitiesModalVisible, setAmenitiesModalVisible] = useState(false);
  const [amenitiesTab, setAmenitiesTab] = useState<"browse" | "my_bookings">("browse");
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [myBookings, setMyBookings] = useState<AmenityBooking[]>([]);
  const [loadingAmenities, setLoadingAmenities] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(getTomorrowDateStr());
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [amenitySchedule, setAmenitySchedule] = useState<any[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);

  // Residents Directory State
  const [directoryModalVisible, setDirectoryModalVisible] = useState(false);
  const [directory, setDirectory] = useState<any[]>([]);
  const [loadingDirectory, setLoadingDirectory] = useState(false);
  const [directorySearch, setDirectorySearch] = useState("");
  const [directoryBlockFilter, setDirectoryBlockFilter] = useState<"ALL" | "Tower A" | "Tower B">("ALL");

  // Rental Management State
  const [leaseModalVisible, setLeaseModalVisible] = useState(false);
  const [leaseData, setLeaseData] = useState<any | null>(null);
  const [loadingLease, setLoadingLease] = useState(false);

  // Notices State
  const [noticesModalVisible, setNoticesModalVisible] = useState(false);
  const [notices, setNotices] = useState<any[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(false);
  const [noticeCategoryFilter, setNoticeCategoryFilter] = useState<string>("ALL");

  // CCTV & Security Desk State
  const [securityModalVisible, setSecurityModalVisible] = useState(false);
  const [securityData, setSecurityData] = useState<any | null>(null);
  const [loadingSecurity, setLoadingSecurity] = useState(false);

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
    setSelectedAmenity(null);
    setSelectedSlot(null);
    try {
      const [amenitiesList, bookingsList] = await Promise.all([
        mobileApiClient.getAmenities(),
        mobileApiClient.getAmenityBookings()
      ]);
      setAmenities(amenitiesList);
      setMyBookings(bookingsList);
    } catch {
      // Graceful error
    } finally {
      setLoadingAmenities(false);
    }
  };

  const handleSelectAmenityForBooking = async (amenity: Amenity) => {
    setSelectedAmenity(amenity);
    setSelectedSlot(null);
    setLoadingSchedule(true);
    try {
      const schedule = await mobileApiClient.getAmenitySchedule(amenity.id);
      setAmenitySchedule(schedule);
    } catch {
      setAmenitySchedule([]);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleChangeBookingDate = async (dateStr: string) => {
    setSelectedDateStr(dateStr);
    setSelectedSlot(null);
    if (selectedAmenity) {
      setLoadingSchedule(true);
      try {
        const schedule = await mobileApiClient.getAmenitySchedule(selectedAmenity.id);
        setAmenitySchedule(schedule);
      } catch {
        setAmenitySchedule([]);
      } finally {
        setLoadingSchedule(false);
      }
    }
  };

  const isSlotOccupied = (slot: any): boolean => {
    if (!amenitySchedule || amenitySchedule.length === 0) return false;
    const pad = (n: number) => n.toString().padStart(2, "0");
    const slotStart = new Date(`${selectedDateStr}T${pad(slot.startHour)}:${pad(slot.startMin)}:00.000Z`).getTime();
    const slotEnd = new Date(`${selectedDateStr}T${pad(slot.endHour)}:${pad(slot.endMin)}:00.000Z`).getTime();
    return amenitySchedule.some((b: any) => {
      if (b.status !== "CONFIRMED") return false;
      const bStart = new Date(b.startTime).getTime();
      const bEnd = new Date(b.endTime).getTime();
      return slotStart < bEnd && slotEnd > bStart;
    });
  };

  const handleConfirmReservation = async () => {
    if (!selectedAmenity || !selectedSlot) {
      Alert.alert("Incomplete Selection", "Please choose an amenity date and time slot.");
      return;
    }

    setBookingInProgress(true);
    try {
      const pad = (n: number) => n.toString().padStart(2, "0");
      const startTime = `${selectedDateStr}T${pad(selectedSlot.startHour)}:${pad(selectedSlot.startMin)}:00.000Z`;
      const endTime = `${selectedDateStr}T${pad(selectedSlot.endHour)}:${pad(selectedSlot.endMin)}:00.000Z`;

      await mobileApiClient.bookAmenity(selectedAmenity.id, startTime, endTime);
      const updatedBookings = await mobileApiClient.getAmenityBookings();
      setMyBookings(updatedBookings);

      const amenityName = selectedAmenity.name;
      const confirmedSlot = selectedSlot.label;
      setSelectedAmenity(null);
      setSelectedSlot(null);
      setAmenitiesTab("my_bookings");

      Alert.alert(
        "Booking Confirmed! 🎉",
        `Your reservation for ${amenityName} on ${selectedDateStr} (${confirmedSlot}) has been confirmed.`
      );
    } catch (err: any) {
      Alert.alert("Reservation Failed", err.message || "This slot is already booked or unavailable.");
    } finally {
      setBookingInProgress(false);
    }
  };

  const handleCancelBooking = (booking: AmenityBooking) => {
    Alert.alert(
      "Cancel Reservation",
      `Cancel your booking for ${booking.amenityName || "this facility"}?`,
      [
        { text: "Keep Booking", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setCancellingBookingId(booking.id);
            try {
              await mobileApiClient.cancelBooking(booking.id);
              const updated = await mobileApiClient.getAmenityBookings();
              setMyBookings(updated);
              Alert.alert("Cancelled", "Your reservation has been cancelled.");
            } catch (err: any) {
              Alert.alert("Error", err.message || "Could not cancel booking.");
            } finally {
              setCancellingBookingId(null);
            }
          }
        }
      ]
    );
  };

  const handleOpenDirectory = async () => {
    setDirectoryModalVisible(true);
    setLoadingDirectory(true);
    try {
      const data = await mobileApiClient.getResidentsDirectory();
      setDirectory(data);
    } catch {
      // Graceful error
    } finally {
      setLoadingDirectory(false);
    }
  };

  const handleOpenLease = async () => {
    setLeaseModalVisible(true);
    setLoadingLease(true);
    try {
      const data = await mobileApiClient.getResidentLease();
      setLeaseData(data);
    } catch {
      // Graceful error
    } finally {
      setLoadingLease(false);
    }
  };

  const handleOpenNotices = async () => {
    setNoticesModalVisible(true);
    setLoadingNotices(true);
    try {
      const data = await mobileApiClient.getResidentNotices();
      setNotices(data);
    } catch {
      // Graceful error
    } finally {
      setLoadingNotices(false);
    }
  };

  const handleOpenSecurity = async () => {
    setSecurityModalVisible(true);
    setLoadingSecurity(true);
    try {
      const data = await mobileApiClient.getSecurityDesk();
      setSecurityData(data);
    } catch {
      // Graceful error
    } finally {
      setLoadingSecurity(false);
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
    } else if (moduleId === "residents") {
      handleOpenDirectory();
    } else if (moduleId === "rentals") {
      handleOpenLease();
    } else if (moduleId === "cctv") {
      handleOpenSecurity();
    } else if (moduleId === "notices") {
      handleOpenNotices();
    } else if (moduleId === "notifications" && onOpenNotifications) {
      onOpenNotifications();
    } else if (moduleId === "visitors" && onNavigateTab) {
      onNavigateTab("visitors");
    } else if (moduleId === "maintenance" && onNavigateTab) {
      onNavigateTab("services");
    } else if (moduleId === "chat" && onNavigateTab) {
      onNavigateTab("chat");
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
          <View style={[styles.modalContent, { maxHeight: "90%" }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View>
                <Text style={styles.modalTitle}>Shared Amenities</Text>
                <Text style={styles.modalSubtitle}>Book clubhouses, sports courts, and facilities</Text>
              </View>
              <TouchableOpacity onPress={() => setAmenitiesModalVisible(false)} style={styles.closeRoundBtn}>
                <Text style={styles.closeRoundBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Segmented Tabs: Facilities vs My Reservations */}
            <View style={styles.amenityTabBar}>
              <TouchableOpacity
                style={[styles.amenityTabBtn, amenitiesTab === "browse" && styles.amenityTabBtnActive]}
                onPress={() => {
                  setAmenitiesTab("browse");
                  setSelectedAmenity(null);
                }}
              >
                <Text style={[styles.amenityTabBtnText, amenitiesTab === "browse" && styles.amenityTabBtnTextActive]}>
                  🏊 Facilities ({amenities.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.amenityTabBtn, amenitiesTab === "my_bookings" && styles.amenityTabBtnActive]}
                onPress={() => setAmenitiesTab("my_bookings")}
              >
                <Text style={[styles.amenityTabBtnText, amenitiesTab === "my_bookings" && styles.amenityTabBtnTextActive]}>
                  📅 My Bookings ({myBookings.filter((b) => b.status === "CONFIRMED").length})
                </Text>
              </TouchableOpacity>
            </View>

            {loadingAmenities ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 30 }} />
            ) : amenitiesTab === "browse" ? (
              selectedAmenity ? (
                /* Facility Slot Booking Flow */
                <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
                  <TouchableOpacity
                    style={styles.backLink}
                    onPress={() => {
                      setSelectedAmenity(null);
                      setSelectedSlot(null);
                    }}
                  >
                    <Text style={styles.backLinkText}>← Back to Facilities List</Text>
                  </TouchableOpacity>

                  <View style={styles.selectedFacilityHeader}>
                    <Text style={styles.selectedFacilityTitle}>{selectedAmenity.name}</Text>
                    <Text style={styles.selectedFacilityDesc}>{selectedAmenity.description}</Text>
                    <Text style={styles.selectedFacilityMeta}>
                      Hours: {selectedAmenity.openTime} - {selectedAmenity.closeTime} • Capacity: {selectedAmenity.capacity} persons
                    </Text>
                    {selectedAmenity.rules ? (
                      <Text style={styles.selectedFacilityRules}>📌 {selectedAmenity.rules}</Text>
                    ) : null}
                  </View>

                  {/* Step 1: Select Date */}
                  <Text style={styles.slotSectionTitle}>1. Select Booking Date</Text>
                  <View style={styles.dateSelectorRow}>
                    {getAvailableBookingDates().map((item) => {
                      const isSelected = selectedDateStr === item.dateStr;
                      return (
                        <TouchableOpacity
                          key={item.dateStr}
                          style={[styles.dateChoiceBtn, isSelected && styles.dateChoiceBtnActive]}
                          onPress={() => handleChangeBookingDate(item.dateStr)}
                        >
                          <Text style={[styles.dateChoiceDay, isSelected && styles.dateChoiceDayActive]}>
                            {item.dayName}
                          </Text>
                          <Text style={[styles.dateChoiceDate, isSelected && styles.dateChoiceDateActive]}>
                            {item.dateStr.slice(5)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Step 2: Select Time Slot */}
                  <Text style={styles.slotSectionTitle}>2. Choose Time Slot (2-Hour Window)</Text>
                  {loadingSchedule ? (
                    <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
                  ) : (
                    <View style={styles.slotsGrid}>
                      {AMENITY_TIME_SLOTS.map((slot) => {
                        const occupied = isSlotOccupied(slot);
                        const isChosen = selectedSlot?.id === slot.id;
                        return (
                          <TouchableOpacity
                            key={slot.id}
                            style={[
                              styles.slotChoiceChip,
                              isChosen && styles.slotChoiceChipActive,
                              occupied && styles.slotChoiceChipDisabled
                            ]}
                            disabled={occupied || bookingInProgress}
                            onPress={() => setSelectedSlot(slot)}
                          >
                            <Text
                              style={[
                                styles.slotChoiceText,
                                isChosen && styles.slotChoiceTextActive,
                                occupied && styles.slotChoiceTextDisabled
                              ]}
                            >
                              {slot.label}
                            </Text>
                            {occupied ? (
                              <Text style={styles.slotStatusTagDisabled}>Reserved</Text>
                            ) : isChosen ? (
                              <Text style={styles.slotStatusTagActive}>Selected ✓</Text>
                            ) : (
                              <Text style={styles.slotStatusTagAvailable}>Available</Text>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}

                  {/* Booking Summary & Confirm */}
                  {selectedSlot && (
                    <View style={styles.bookingSummaryBox}>
                      <Text style={styles.summaryTitle}>Reservation Summary</Text>
                      <Text style={styles.summaryRow}>Facility: <Text style={styles.summaryBold}>{selectedAmenity.name}</Text></Text>
                      <Text style={styles.summaryRow}>Date: <Text style={styles.summaryBold}>{selectedDateStr}</Text></Text>
                      <Text style={styles.summaryRow}>Time: <Text style={styles.summaryBold}>{selectedSlot.label}</Text></Text>
                      <Text style={styles.summaryRow}>Unit Flat: <Text style={styles.summaryBold}>{currentUnit ? `${currentUnit.block} - ${currentUnit.unitNumber}` : "Tower A - 402"}</Text></Text>

                      <TouchableOpacity
                        style={styles.confirmReservationBtn}
                        onPress={handleConfirmReservation}
                        disabled={bookingInProgress}
                      >
                        {bookingInProgress ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.confirmReservationBtnText}>Confirm Reservation</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </ScrollView>
              ) : (
                /* List Facilities */
                <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
                  {amenities.map((amenity) => (
                    <View key={amenity.id} style={styles.amenityCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.amenityName}>{amenity.name}</Text>
                        <Text style={styles.amenityDesc}>{amenity.description}</Text>
                        <Text style={styles.amenityMeta}>
                          Capacity: {amenity.capacity} • Hours: {amenity.openTime} - {amenity.closeTime}
                        </Text>
                        {amenity.rules ? (
                          <Text style={styles.amenityRulesSnippet}>Rule: {amenity.rules}</Text>
                        ) : null}
                      </View>
                      <TouchableOpacity
                        style={styles.bookBtn}
                        onPress={() => handleSelectAmenityForBooking(amenity)}
                      >
                        <Text style={styles.bookBtnText}>Select Slot & Book</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )
            ) : (
              /* My Bookings View */
              <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
                {myBookings.length === 0 ? (
                  <View style={styles.emptyBookingsBox}>
                    <Text style={styles.emptyBookingsIcon}>📅</Text>
                    <Text style={styles.emptyBookingsTitle}>No Active Reservations</Text>
                    <Text style={styles.emptyBookingsSub}>
                      You haven't reserved any facilities yet. Switch to Facilities to book a court, pool, or hall.
                    </Text>
                  </View>
                ) : (
                  myBookings.map((b) => {
                    const isCancelled = b.status === "CANCELLED";
                    const isCancelling = cancellingBookingId === b.id;
                    const dateFormatted = new Date(b.startTime).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    });
                    const timeFormatted = `${new Date(b.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${new Date(b.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

                    return (
                      <View key={b.id} style={styles.myBookingCard}>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <Text style={styles.myBookingTitle}>{b.amenityName || "Community Facility"}</Text>
                            <StatusPill
                              label={b.status}
                              tone={b.status === "CONFIRMED" ? "green" : "blue"}
                            />
                          </View>
                          <Text style={styles.myBookingDate}>📅 {dateFormatted}</Text>
                          <Text style={styles.myBookingTime}>⏰ {timeFormatted}</Text>
                          <Text style={styles.myBookingRef}>Ref ID: {b.id.slice(0, 16)}...</Text>
                        </View>

                        {!isCancelled && (
                          <TouchableOpacity
                            style={styles.cancelBookingBtn}
                            onPress={() => handleCancelBooking(b)}
                            disabled={isCancelling}
                          >
                            {isCancelling ? (
                              <ActivityIndicator size="small" color={colors.danger} />
                            ) : (
                              <Text style={styles.cancelBookingBtnText}>Cancel</Text>
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })
                )}
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

      {/* Residents Directory Modal */}
      <Modal visible={directoryModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "88%" }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View>
                <Text style={styles.modalTitle}>Residents Directory</Text>
                <Text style={styles.modalSubtitle}>Greenfield Heights • Neighbor Directory</Text>
              </View>
              <TouchableOpacity onPress={() => setDirectoryModalVisible(false)} style={styles.closeRoundBtn}>
                <Text style={styles.closeRoundBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <TextInput
              style={styles.directorySearchInput}
              placeholder="Search by Flat, Tower, or Resident..."
              value={directorySearch}
              onChangeText={setDirectorySearch}
            />

            {/* Tower Filter Chips */}
            <View style={styles.filterChipRow}>
              {(["ALL", "Tower A", "Tower B"] as const).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterChip, directoryBlockFilter === filter && styles.filterChipActive]}
                  onPress={() => setDirectoryBlockFilter(filter)}
                >
                  <Text style={[styles.filterChipText, directoryBlockFilter === filter && styles.filterChipTextActive]}>
                    {filter === "ALL" ? "All Blocks" : filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {loadingDirectory ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 30 }} />
            ) : (
              <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
                {directory
                  .filter((item) => {
                    const matchBlock = directoryBlockFilter === "ALL" || item.block === directoryBlockFilter;
                    const q = directorySearch.toLowerCase();
                    const matchSearch =
                      !q ||
                      item.unitNumber.toLowerCase().includes(q) ||
                      item.block.toLowerCase().includes(q) ||
                      item.residentName.toLowerCase().includes(q);
                    return matchBlock && matchSearch;
                  })
                  .map((res) => (
                    <View key={res.id} style={styles.directoryCard}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                          <Text style={styles.directoryUnit}>{res.block} - {res.unitNumber}</Text>
                          {res.isSelf && <Text style={styles.selfBadge}>You</Text>}
                          <StatusPill
                            label={res.status === "OCCUPIED" ? "Occupied" : "Vacant"}
                            tone={res.status === "OCCUPIED" ? "green" : "blue"}
                          />
                        </View>
                        <Text style={styles.directoryName}>👤 {res.residentName}</Text>
                        <Text style={styles.directoryMeta}>
                          Floor {res.floor} • {res.unitType || "Residential"} • {res.squareFeet ? `${res.squareFeet} sq.ft` : "Standard"}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.directoryChatBtn}
                        onPress={() => {
                          setDirectoryModalVisible(false);
                          if (onNavigateTab) onNavigateTab("chat");
                        }}
                      >
                        <Text style={styles.directoryChatBtnText}>Message</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
              </ScrollView>
            )}

            <View style={[styles.modalActions, { marginTop: spacing.md }]}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setDirectoryModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rental & Tenancy Management Modal */}
      <Modal visible={leaseModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "88%" }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View>
                <Text style={styles.modalTitle}>Rental & Lease Records</Text>
                <Text style={styles.modalSubtitle}>Verified Tenancy & Freehold Title Records</Text>
              </View>
              <TouchableOpacity onPress={() => setLeaseModalVisible(false)} style={styles.closeRoundBtn}>
                <Text style={styles.closeRoundBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {loadingLease ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 30 }} />
            ) : leaseData ? (
              <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                {/* Verification Hero Badge */}
                <View style={styles.leaseHeroCard}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={styles.leaseHeroFlat}>{leaseData.block} — Unit {leaseData.unitNumber}</Text>
                    <StatusPill
                      label={leaseData.occupancyRole === "RESIDENT_OWNER" ? "Owner Title" : "Verified Tenant"}
                      tone="green"
                    />
                  </View>
                  <Text style={styles.leaseHeroProperty}>{leaseData.propertyName}</Text>
                  <Text style={styles.leaseHeroStatus}>🛡️ {String(leaseData.verificationStatus || "").replace(/_/g, " ")}</Text>
                </View>

                {/* Details Section */}
                <View style={styles.leaseDetailsCard}>
                  <Text style={styles.leaseSectionHeading}>Agreement Overview</Text>

                  <View style={styles.leaseRow}>
                    <Text style={styles.leaseLabel}>Agreement / Deed ID</Text>
                    <Text style={styles.leaseValue}>{leaseData.leaseAgreementNumber}</Text>
                  </View>

                  <View style={styles.leaseRow}>
                    <Text style={styles.leaseLabel}>Tenancy Term</Text>
                    <Text style={styles.leaseValue}>{leaseData.agreementStartDate} to {leaseData.agreementEndDate}</Text>
                  </View>

                  <View style={styles.leaseRow}>
                    <Text style={styles.leaseLabel}>Managing Entity / Landlord</Text>
                    <Text style={styles.leaseValue}>{leaseData.landlordOrEntity}</Text>
                  </View>

                  <View style={styles.leaseRow}>
                    <Text style={styles.leaseLabel}>Association Dues (Monthly)</Text>
                    <Text style={[styles.leaseValue, { color: colors.primary }]}>₹{Number(leaseData.monthlyMaintenance || 0).toLocaleString()}</Text>
                  </View>

                  {leaseData.monthlyRent && (
                    <View style={styles.leaseRow}>
                      <Text style={styles.leaseLabel}>Base Rent (Monthly)</Text>
                      <Text style={[styles.leaseValue, { color: colors.success }]}>₹{Number(leaseData.monthlyRent).toLocaleString()}</Text>
                    </View>
                  )}

                  <View style={styles.leaseRow}>
                    <Text style={styles.leaseLabel}>Security Hotline</Text>
                    <Text style={styles.leaseValue}>{leaseData.emergencyContact}</Text>
                  </View>
                </View>

                <View style={styles.paymentInfoNote}>
                  <Text style={styles.paymentInfoNoteTitle}>💳 Settlement & Payment Instructions</Text>
                  <Text style={styles.paymentInfoNoteText}>{leaseData.paymentInstructions}</Text>
                </View>
              </ScrollView>
            ) : null}

            <View style={[styles.modalActions, { marginTop: spacing.md }]}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setLeaseModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Notices & Circulars Modal */}
      <Modal visible={noticesModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "88%" }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View>
                <Text style={styles.modalTitle}>Notices & Circulars</Text>
                <Text style={styles.modalSubtitle}>Official Society Announcements & Directives</Text>
              </View>
              <TouchableOpacity onPress={() => setNoticesModalVisible(false)} style={styles.closeRoundBtn}>
                <Text style={styles.closeRoundBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Category Filter Chips */}
            <View style={styles.filterChipRow}>
              {["ALL", "MAINTENANCE", "AMENITY", "GENERAL"].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.filterChip, noticeCategoryFilter === cat && styles.filterChipActive]}
                  onPress={() => setNoticeCategoryFilter(cat)}
                >
                  <Text style={[styles.filterChipText, noticeCategoryFilter === cat && styles.filterChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {loadingNotices ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 30 }} />
            ) : (
              <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
                {notices
                  .filter((n) => noticeCategoryFilter === "ALL" || (n.category && n.category.toUpperCase() === noticeCategoryFilter))
                  .map((notice) => (
                    <View key={notice.id} style={styles.noticeModalCard}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={styles.noticeModalCategory}>{notice.category || "COMMUNITY"}</Text>
                        <StatusPill
                          label={notice.priority || "NORMAL"}
                          tone={notice.priority === "HIGH" ? "red" : "blue"}
                        />
                      </View>
                      <Text style={styles.noticeModalTitle}>{notice.title}</Text>
                      <Text style={styles.noticeModalContent}>{notice.content}</Text>
                      <Text style={styles.noticeModalMeta}>
                        Issued by: {notice.authorName || "Administration"} • {new Date(notice.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  ))}
              </ScrollView>
            )}

            <View style={[styles.modalActions, { marginTop: spacing.md }]}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setNoticesModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CCTV & Security Desk Modal */}
      <Modal visible={securityModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "88%" }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View>
                <Text style={styles.modalTitle}>Security & Surveillance Desk</Text>
                <Text style={styles.modalSubtitle}>Gate Operations & Emergency Dispatch</Text>
              </View>
              <TouchableOpacity onPress={() => setSecurityModalVisible(false)} style={styles.closeRoundBtn}>
                <Text style={styles.closeRoundBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {loadingSecurity ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 30 }} />
            ) : securityData ? (
              <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                {/* Live Checkpoints */}
                <Text style={styles.securitySectionHeading}>📹 Active Checkpoints & Gate Feeds</Text>
                {securityData.checkpoints?.map((cp: any) => (
                  <View key={cp.id} style={styles.securityCheckpointRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.checkpointName}>{cp.name}</Text>
                      <Text style={styles.checkpointMeta}>{cp.type} • Guard: {cp.guardName}</Text>
                    </View>
                    <StatusPill label={cp.status} tone="green" />
                  </View>
                ))}

                {/* Supervisor & Shift */}
                <View style={styles.guardInfoCard}>
                  <Text style={styles.guardInfoTitle}>👮 {securityData.supervisorOnDuty}</Text>
                  <Text style={styles.guardInfoSub}>Current Shift: {securityData.currentShift}</Text>
                </View>

                {/* Emergency Helplines */}
                <Text style={styles.securitySectionHeading}>🚨 Direct Emergency Dispatch</Text>
                <View style={styles.helplineGrid}>
                  <View style={styles.helplineCard}>
                    <Text style={styles.helplineLabel}>Main Gate Intercom</Text>
                    <Text style={styles.helplineNumber}>{securityData.emergencyHelplines?.gateIntercom}</Text>
                  </View>
                  <View style={styles.helplineCard}>
                    <Text style={styles.helplineLabel}>Security Supervisor</Text>
                    <Text style={styles.helplineNumber}>{securityData.emergencyHelplines?.securitySupervisor}</Text>
                  </View>
                  <View style={styles.helplineCard}>
                    <Text style={styles.helplineLabel}>Police Emergency</Text>
                    <Text style={styles.helplineNumber}>100</Text>
                  </View>
                  <View style={styles.helplineCard}>
                    <Text style={styles.helplineLabel}>Ambulance Dispatch</Text>
                    <Text style={styles.helplineNumber}>108</Text>
                  </View>
                </View>
              </ScrollView>
            ) : null}

            <View style={[styles.modalActions, { marginTop: spacing.md }]}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setSecurityModalVisible(false)}
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
  },
  closeRoundBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center"
  },
  closeRoundBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted
  },
  amenityTabBar: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 3,
    marginVertical: 12
  },
  amenityTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6
  },
  amenityTabBtnActive: {
    backgroundColor: "#fff"
  },
  amenityTabBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted
  },
  amenityTabBtnTextActive: {
    color: colors.primary,
    fontWeight: "700"
  },
  backLink: {
    paddingVertical: 6,
    marginBottom: 8
  },
  backLinkText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary
  },
  selectedFacilityHeader: {
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    marginBottom: 12
  },
  selectedFacilityTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textMain
  },
  selectedFacilityDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginVertical: 3
  },
  selectedFacilityMeta: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.primary
  },
  selectedFacilityRules: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    fontStyle: "italic"
  },
  slotSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMain,
    marginTop: 10,
    marginBottom: 6
  },
  dateSelectorRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10
  },
  dateChoiceBtn: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center"
  },
  dateChoiceBtnActive: {
    backgroundColor: "#dbeafe",
    borderColor: colors.primary
  },
  dateChoiceDay: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted
  },
  dateChoiceDayActive: {
    color: colors.primary,
    fontWeight: "700"
  },
  dateChoiceDate: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMain,
    marginTop: 2
  },
  dateChoiceDateActive: {
    color: colors.primary
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12
  },
  slotChoiceChip: {
    width: "48%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 8,
    alignItems: "center"
  },
  slotChoiceChipActive: {
    backgroundColor: "#dbeafe",
    borderColor: colors.primary,
    borderWidth: 2
  },
  slotChoiceChipDisabled: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
    opacity: 0.6
  },
  slotChoiceText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMain
  },
  slotChoiceTextActive: {
    color: colors.primary
  },
  slotChoiceTextDisabled: {
    color: colors.textMuted
  },
  slotStatusTagDisabled: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.danger,
    marginTop: 3
  },
  slotStatusTagActive: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 3
  },
  slotStatusTagAvailable: {
    fontSize: 9,
    fontWeight: "600",
    color: colors.success,
    marginTop: 3
  },
  bookingSummaryBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    padding: 12,
    marginTop: 8,
    marginBottom: 16
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textMain,
    marginBottom: 6
  },
  summaryRow: {
    fontSize: 12,
    color: colors.textMuted,
    marginVertical: 2
  },
  summaryBold: {
    fontWeight: "700",
    color: colors.textMain
  },
  confirmReservationBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 10
  },
  confirmReservationBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700"
  },
  amenityRulesSnippet: {
    fontSize: 10,
    color: colors.textMuted,
    fontStyle: "italic",
    marginTop: 2
  },
  emptyBookingsBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
    paddingHorizontal: 16
  },
  emptyBookingsIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  emptyBookingsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMain
  },
  emptyBookingsSub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 4
  },
  myBookingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 8
  },
  myBookingTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMain
  },
  myBookingDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4
  },
  myBookingTime: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.primary,
    marginTop: 2
  },
  myBookingRef: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2
  },
  cancelBookingBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#fee2e2",
    borderRadius: 6,
    marginLeft: 10
  },
  cancelBookingBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.danger
  },
  directorySearchInput: {
    backgroundColor: colors.bgPage,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.textMain,
    marginVertical: 10
  },
  filterChipRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  filterChipActive: {
    backgroundColor: "#dbeafe",
    borderColor: colors.primary
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: "700"
  },
  directoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgPage,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    marginBottom: 8
  },
  directoryUnit: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMain
  },
  selfBadge: {
    fontSize: 9,
    fontWeight: "700",
    color: "#fff",
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4
  },
  directoryName: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMain,
    marginTop: 2
  },
  directoryMeta: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2
  },
  directoryChatBtn: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8
  },
  directoryChatBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary
  },
  leaseHeroCard: {
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    padding: 12,
    marginBottom: 12
  },
  leaseHeroFlat: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textMain
  },
  leaseHeroProperty: {
    fontSize: 12,
    color: colors.textMuted,
    marginVertical: 2
  },
  leaseHeroStatus: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
    marginTop: 4
  },
  leaseDetailsCard: {
    backgroundColor: colors.bgPage,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 12
  },
  leaseSectionHeading: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textMain,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8
  },
  leaseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9"
  },
  leaseLabel: {
    fontSize: 11,
    color: colors.textMuted
  },
  leaseValue: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMain
  },
  paymentInfoNote: {
    backgroundColor: "#fefce8",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fef08a",
    padding: 10,
    marginBottom: 12
  },
  paymentInfoNoteTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#854d0e",
    marginBottom: 2
  },
  paymentInfoNoteText: {
    fontSize: 11,
    color: "#713f12"
  },
  noticeModalCard: {
    backgroundColor: colors.bgPage,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 8
  },
  noticeModalCategory: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 0.5
  },
  noticeModalTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMain,
    marginTop: 3
  },
  noticeModalContent: {
    fontSize: 12,
    color: colors.textMuted,
    marginVertical: 4
  },
  noticeModalMeta: {
    fontSize: 10,
    color: colors.textMuted
  },
  securitySectionHeading: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textMain,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginVertical: 8
  },
  securityCheckpointRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgPage,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    marginBottom: 6
  },
  checkpointName: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMain
  },
  checkpointMeta: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2
  },
  guardInfoCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 10,
    marginVertical: 8
  },
  guardInfoTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMain
  },
  guardInfoSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2
  },
  helplineGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12
  },
  helplineCard: {
    width: "48%",
    backgroundColor: colors.bgPage,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10
  },
  helplineLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textMuted
  },
  helplineNumber: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
    marginTop: 2
  }
});
