import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { LockIcon, MessageIcon } from "../components/MobileIcons";

interface ChatContact {
  id: string;
  name: string;
  subtext: string;
  initials: string;
  unread: number;
  time: string;
  color: string;
}

const channels: ChatContact[] = [
  {
    id: "helpdesk",
    name: "Apartment Helpdesk",
    subtext: "Official • Your request MR-1048 has been assigned",
    initials: "AH",
    unread: 2,
    time: "6:18 PM",
    color: colors.primary
  },
  {
    id: "community",
    name: "Community Broadcast",
    subtext: "Water supply update scheduled at 8:00 PM",
    initials: "CB",
    unread: 1,
    time: "5:40 PM",
    color: colors.secondary
  },
  {
    id: "security",
    name: "Security Control Room",
    subtext: "Gate 1 team available for deliveries",
    initials: "SC",
    unread: 0,
    time: "4:15 PM",
    color: colors.darkStructural
  },
  {
    id: "maintenance",
    name: "Maintenance Desk",
    subtext: "Technician expected between 7:00 PM and 7:30 PM",
    initials: "MD",
    unread: 0,
    time: "Yesterday",
    color: colors.warning
  },
  {
    id: "neighbor",
    name: "Nisha Rao",
    subtext: "Unit B-804 • Thank you for the update!",
    initials: "NR",
    unread: 0,
    time: "Yesterday",
    color: colors.primary
  }
];

export function ChatScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>COMMUNICATIONS & MESSAGING</Text>
        <Text style={styles.pageHeading}>Community Channels</Text>
        <Text style={styles.pageSubheading}>
          Official society desks, facilities, and masked resident channels
        </Text>
      </View>

      {/* Privacy Notice Card */}
      <View style={styles.privacyCard}>
        <View style={styles.lockBadge}>
          <LockIcon size={14} color={colors.primary} />
        </View>
        <View style={styles.privacyContent}>
          <Text style={styles.privacyTitle}>Masked Privacy Protection Active</Text>
          <Text style={styles.privacyBody}>
            Phone numbers and direct identities remain masked. Messages between residents and staff are routed securely through society servers.
          </Text>
        </View>
      </View>

      {/* Channels List */}
      <View style={styles.channelList}>
        {channels.map((channel, index) => (
          <TouchableOpacity
            key={channel.id}
            style={[
              styles.channelRow,
              index === channels.length - 1 && { borderBottomWidth: 0 }
            ]}
            activeOpacity={0.7}
          >
            <View style={[styles.avatar, { backgroundColor: channel.color }]}>
              <Text style={styles.avatarText}>{channel.initials}</Text>
            </View>

            <View style={styles.channelInfo}>
              <View style={styles.channelTop}>
                <Text style={styles.channelName}>{channel.name}</Text>
                <Text style={styles.channelTime}>{channel.time}</Text>
              </View>
              <Text style={styles.channelSubtext} numberOfLines={1}>
                {channel.subtext}
              </Text>
            </View>

            {channel.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{channel.unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: 40,
    backgroundColor: colors.bgPage
  },
  header: {
    marginBottom: 16
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: 0.8,
    marginBottom: 3
  },
  pageHeading: {
    fontSize: 24,
    fontWeight: typography.weights.heavy,
    color: colors.textMain,
    letterSpacing: -0.4
  },
  pageSubheading: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2
  },
  privacyCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 20,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3
  },
  lockBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#E8F4EF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10
  },
  privacyContent: {
    flex: 1
  },
  privacyTitle: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
    marginBottom: 2
  },
  privacyBody: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 15
  },
  channelList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden"
  },
  channelRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F7F8F6"
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    color: "#ffffff",
    fontWeight: typography.weights.bold,
    fontSize: 14
  },
  channelInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8
  },
  channelTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2
  },
  channelName: {
    fontSize: 14,
    fontWeight: typography.weights.bold,
    color: colors.textMain
  },
  channelTime: {
    fontSize: 10,
    color: colors.textMuted
  },
  channelSubtext: {
    fontSize: 12,
    color: colors.textMuted
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  unreadText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: typography.weights.bold
  }
});
