import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

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
    name: "Community Portal Broadcast",
    subtext: "Water supply update scheduled at 8:00 PM",
    initials: "CP",
    unread: 1,
    time: "5:40 PM",
    color: colors.violet
  },
  {
    id: "security",
    name: "Security Control Room",
    subtext: "Gate 1 team available for deliveries",
    initials: "SC",
    unread: 0,
    time: "4:15 PM",
    color: colors.danger
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
    color: colors.success
  }
];

export function ChatScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.pageHeading}>Community Messages</Text>
        <Text style={styles.pageSubheading}>Official helpdesks and masked resident chat</Text>
      </View>

      {/* Privacy Notice Card */}
      <View style={styles.privacyCard}>
        <Text style={styles.privacyTitle}>🔒 Masked Privacy Directory</Text>
        <Text style={styles.privacyBody}>
          Phone numbers remain private. Messages between residents and staff are routed securely.
        </Text>
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
    paddingBottom: spacing.xxl
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
  privacyCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: spacing.radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg
  },
  privacyTitle: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.bold,
    color: colors.textMain,
    marginBottom: 2
  },
  privacyBody: {
    fontSize: typography.sizes.caption,
    color: colors.textMuted,
    lineHeight: typography.lineHeights.caption
  },
  channelList: {
    backgroundColor: colors.bgSurface,
    borderRadius: spacing.radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden"
  },
  channelRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: spacing.radius.round,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    color: "#ffffff",
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.body
  },
  channelInfo: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm
  },
  channelTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2
  },
  channelName: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.textMain
  },
  channelTime: {
    fontSize: typography.sizes.tiny,
    color: colors.textMuted
  },
  channelSubtext: {
    fontSize: typography.sizes.caption,
    color: colors.textMuted
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: spacing.radius.round,
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
