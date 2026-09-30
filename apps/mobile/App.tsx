import React, { useState, useEffect } from "react";
import { StyleSheet, SafeAreaView, View, ActivityIndicator, Text } from "react-native";
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

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [currentUnit, setCurrentUnit] = useState<UnitSummary | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("home");

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
  };

  const handleLogout = async () => {
    await mobileApiClient.logout();
    setCurrentUser(null);
    setCurrentUnit(null);
    setIsAuthenticated(false);
    setActiveTab("home");
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
        return <ServicesScreen />;
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
          />
        );
      case "home":
      default:
        return <HomeScreen onNavigateTab={(tab) => setActiveTab(tab)} />;
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
        unreadNotifications={3}
      />
      <View style={styles.contentContainer}>
        {renderActiveScreen()}
      </View>
      <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
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
  }
});
