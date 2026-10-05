import React, { useState, useEffect } from "react";
import { StyleSheet, SafeAreaView, View, ActivityIndicator, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { colors } from "./src/theme/colors";
import { AppHeader } from "./src/components/AppHeader";
import { BottomTabBar, TabKey } from "./src/components/BottomTabBar";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ServicesScreen } from "./src/screens/ServicesScreen";
import { ChatScreen } from "./src/screens/ChatScreen";
import { VisitorsScreen } from "./src/screens/VisitorsScreen";
import { MoreScreen } from "./src/screens/MoreScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { authStorage } from "./src/services/auth-storage";
import { mobileApiClient } from "./src/services/api-client";
import { AuthUser, UnitSummary } from "@apartment/shared";

interface MobileNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  icon: string;
  unread: boolean;
}

const initialMobileNotifications: MobileNotification[] = [
  {
    id: "m-1",
    title: "Water Tank Cleaning Notice",
    body: "Scheduled tank maintenance tomorrow between 10:00 AM - 12:00 PM.",
    time: "12m ago",
    icon: "💧",
    unread: true
  },
  {
    id: "m-2",
    title: "Visitor Arrived at Gate 1",
    body: "Amazon Delivery Agent verified with Pre-Approved Pass #4021.",
    time: "35m ago",
    icon: "📦",
    unread: true
  },
  {
    id: "m-3",
    title: "Ticket Status: Assigned",
    body: "Your request 'Kitchen Sink Water Leakage' has been assigned to a plumber.",
    time: "1h ago",
    icon: "🔧",
    unread: true
  },
  {
    id: "m-4",
    title: "August Maintenance Due",
    body: "Invoice of ₹4,850 generated. Due date: 15th August.",
    time: "1d ago",
    icon: "💳",
    unread: false
  }
];

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [currentUnit, setCurrentUnit] = useState<UnitSummary | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [notifications, setNotifications] = useState<MobileNotification[]>(initialMobileNotifications);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const loadNotifications = async () => {
    try {
      const realData = await mobileApiClient.getNotifications();
      if (realData && realData.length > 0) {
        const mapped: MobileNotification[] = realData.map((item) => {
          let icon = "🔔";
          if (item.type === "VISITOR") icon = "📦";
          if (item.type === "MAINTENANCE") icon = "🔧";
          if (item.type === "PAYMENT") icon = "💳";
          if (item.type === "NOTICE") icon = "📢";

          const elapsedMs = Date.now() - new Date(item.createdAt).getTime();
          const elapsedMins = Math.max(1, Math.floor(elapsedMs / 60000));
          const time = elapsedMins < 60 ? `${elapsedMins}m ago` : `${Math.floor(elapsedMins / 60)}h ago`;

          return {
            id: item.id,
            title: item.title,
            body: item.body,
            time,
            icon,
            unread: !item.isRead
          };
        });
        setNotifications(mapped);
      }
    } catch {
      // Keep existing notifications on network failure
    }
  };

  // Check persisted credentials on mount
  useEffect(() => {
    async function checkAuthSession() {
      try {
        const token = await authStorage.getToken();
        if (token) {
          const profile = await mobileApiClient.getTenantProfile();
          if (profile && profile.resident) {
            setCurrentUser(profile.resident);
            setCurrentUnit(profile.unit || null);
            setIsAuthenticated(true);
            loadNotifications();
          } else {
            await authStorage.clearAll();
            setIsAuthenticated(false);
          }
        }
      } catch {
        // If token expired or network unavailable, clear session
        await authStorage.clearAll();
        setIsAuthenticated(false);
      } finally {
        setIsInitializing(false);
      }
    }

    checkAuthSession();
  }, []);

  const handleLoginSuccess = (user: AuthUser, unit?: UnitSummary) => {
    setCurrentUser(user);
    if (unit) setCurrentUnit(unit);
    setIsAuthenticated(true);
    setActiveTab("home");
    loadNotifications();
  };

  const handleLogout = async () => {
    await mobileApiClient.logout();
    setCurrentUser(null);
    setCurrentUnit(null);
    setIsAuthenticated(false);
    setActiveTab("home");
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => n.unread);
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
    for (const item of unread) {
      mobileApiClient.markNotificationRead(item.id).catch(() => {});
    }
  };

  // Initial authentication check spinner
  if (isInitializing) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Verifying secure session...</Text>
      </SafeAreaView>
    );
  }

  // Unauthenticated State: Show Native Login Screen
  if (!isAuthenticated) {
    return (
      <>
        <StatusBar style="dark" />
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  // Authenticated State: Show 5-Tab Native Shell
  const renderActiveScreen = () => {
    switch (activeTab) {
      case "services":
        return <ServicesScreen onNavigateTab={(tab) => setActiveTab(tab)} />;
      case "chat":
        return <ChatScreen />;
      case "visitors":
        return <VisitorsScreen />;
      case "more":
        return (
          <MoreScreen
            currentUser={currentUser}
            currentUnit={currentUnit}
            onLogout={handleLogout}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenNotifications={() => {
              loadNotifications();
              setNotificationModalVisible(true);
            }}
          />
        );
      case "home":
      default:
        return <HomeScreen currentUnit={currentUnit} onNavigateTab={(tab) => setActiveTab(tab)} />;
    }
  };

  const screenTitles: Record<TabKey, string> = {
    home: "Community Portal",
    services: "Maintenance & Services",
    chat: "Messages & Helpdesk",
    visitors: "Gate & Visitor Desk",
    more: "Community Services"
  };

  const unitTag = currentUnit
    ? `${currentUnit.block} - ${currentUnit.unitNumber}`
    : "Tower A - 402";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <AppHeader
        title={screenTitles[activeTab]}
        roleBadge={`${unitTag} • ${currentUser?.fullName || "Resident"}`}
        unreadNotifications={unreadCount}
        onNotificationPress={() => {
          loadNotifications();
          setNotificationModalVisible(true);
        }}
      />
      <View style={styles.contentContainer}>
        {renderActiveScreen()}
      </View>
      <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Notifications Drawer Modal */}
      <Modal
        visible={notificationModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setNotificationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Community Alerts</Text>
                <Text style={styles.modalSubtitle}>Notices, gate entries & service updates</Text>
              </View>
              <TouchableOpacity
                onPress={() => setNotificationModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.notificationsList}>
              {notifications.map((n) => (
                <View key={n.id} style={[styles.notificationCard, n.unread && styles.notificationUnread]}>
                  <Text style={styles.notificationIcon}>{n.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <View style={styles.notificationRow}>
                      <Text style={styles.notifTitle}>{n.title}</Text>
                      <Text style={styles.notifTime}>{n.time}</Text>
                    </View>
                    <Text style={styles.notifBody}>{n.body}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              {unreadCount > 0 && (
                <TouchableOpacity
                  style={styles.markReadBtn}
                  onPress={handleMarkAllRead}
                >
                  <Text style={styles.markReadText}>Mark All as Read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.doneBtn}
                onPress={() => setNotificationModalVisible(false)}
              >
                <Text style={styles.doneBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgPage
  },
  contentContainer: {
    flex: 1
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.bgPage,
    alignItems: "center",
    justifyContent: "center"
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textMuted
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end"
  },
  modalContent: {
    backgroundColor: colors.bgSurface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 24
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textMain
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center"
  },
  modalCloseText: {
    fontSize: 14,
    color: colors.textMain,
    fontWeight: "700"
  },
  notificationsList: {
    paddingHorizontal: 16,
    paddingTop: 12
  },
  notificationCard: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10
  },
  notificationUnread: {
    backgroundColor: "rgba(91, 108, 249, 0.05)",
    borderColor: "rgba(91, 108, 249, 0.25)"
  },
  notificationIcon: {
    fontSize: 24,
    marginTop: 2
  },
  notificationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMain,
    flex: 1,
    marginRight: 8
  },
  notifTime: {
    fontSize: 11,
    color: colors.textMuted
  },
  notifBody: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 17
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14
  },
  markReadBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center"
  },
  markReadText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600"
  },
  doneBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center"
  },
  doneBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700"
  }
});
