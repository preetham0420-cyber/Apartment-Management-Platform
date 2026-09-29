import React, { useState } from "react";
import { StyleSheet, SafeAreaView, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { colors } from "./src/theme/colors";
import { AppHeader } from "./src/components/AppHeader";
import { BottomTabBar, TabKey } from "./src/components/BottomTabBar";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ServicesScreen } from "./src/screens/ServicesScreen";
import { ChatScreen } from "./src/screens/ChatScreen";
import { VisitorsScreen } from "./src/screens/VisitorsScreen";
import { MoreScreen } from "./src/screens/MoreScreen";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");

  const renderActiveScreen = () => {
    switch (activeTab) {
      case "services":
        return <ServicesScreen />;
      case "chat":
        return <ChatScreen />;
      case "visitors":
        return <VisitorsScreen />;
      case "more":
        return <MoreScreen />;
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <AppHeader
        title={screenTitles[activeTab]}
        roleBadge="Resident Access"
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
  }
});
