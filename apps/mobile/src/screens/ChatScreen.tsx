import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator
} from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { LockIcon } from "../components/MobileIcons";
import { authStorage } from "../services/auth-storage";
import { formatMessageTime, formatConversationTime } from "../utils/date-format";

export interface ChatContact {
  id: string;
  name: string;
  subtext: string;
  initials: string;
  unread: number;
  time: string;
  color: string;
}

export interface ChatMessage {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
  timestamp?: string;
}

const defaultMessages: Record<string, ChatMessage[]> = {
  helpdesk: [
    { id: "1", sender: "them", text: "Hello! This is the official Apartment Helpdesk desk. How may we assist you today?", time: "6:05 PM" },
    { id: "2", sender: "me", text: "Hi, I logged maintenance request MR-1048 regarding the kitchen sink pressure.", time: "6:12 PM" },
    { id: "3", sender: "them", text: "Official • Your request MR-1048 has been assigned to our plumbing technician. Expected visit between 7:00 PM and 7:30 PM.", time: "6:18 PM" }
  ],
  community: [
    { id: "1", sender: "them", text: "Society Broadcast: Regular overhead tank cleaning scheduled for tomorrow from 10:00 AM to 1:00 PM.", time: "4:00 PM" },
    { id: "2", sender: "them", text: "Water supply update: Secondary pump is active. Normal water pressure restored.", time: "5:40 PM" }
  ],
  security: [
    { id: "1", sender: "them", text: "Security Control Room active at Main Gate 1.", time: "3:30 PM" },
    { id: "2", sender: "me", text: "Expecting a package from Amazon around 4:30 PM.", time: "4:10 PM" },
    { id: "3", sender: "them", text: "Gate 1 team available for deliveries. We will verify your digital pass.", time: "4:15 PM" }
  ],
  maintenance: [
    { id: "1", sender: "them", text: "Maintenance Desk: Electrician and Plumber on duty on 4th floor.", time: "Yesterday" },
    { id: "2", sender: "them", text: "Technician expected between 7:00 PM and 7:30 PM for inspection.", time: "Yesterday" }
  ],
  neighbor: [
    { id: "1", sender: "them", text: "Hi Preetham! Did you receive the visitor parking circular for Tower A?", time: "Yesterday" },
    { id: "2", sender: "me", text: "Yes Nisha, parking slot P-402 is registered in the app.", time: "Yesterday" },
    { id: "3", sender: "them", text: "Unit B-804 • Thank you for the update!", time: "Yesterday" }
  ]
};

const defaultChannels: ChatContact[] = [
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
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [channelsList, setChannelsList] = useState<ChatContact[]>(defaultChannels);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(defaultMessages);
  const [inputText, setInputText] = useState("");
  const scrollViewRef = useRef<any>(null);

  // Load persisted channels and messages on component mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const savedChannels = await authStorage.getChatChannels();
        if (savedChannels && isMounted) {
          const parsedChannels: ChatContact[] = JSON.parse(savedChannels);
          if (Array.isArray(parsedChannels) && parsedChannels.length > 0) {
            setChannelsList(parsedChannels);
          }
        }
        const savedMessages = await authStorage.getChatMessages();
        if (savedMessages && isMounted) {
          const parsedMessages = JSON.parse(savedMessages);
          if (parsedMessages && typeof parsedMessages === "object") {
            setMessages((prev) => ({ ...prev, ...parsedMessages }));
          }
        }
      } catch {
        // Fallback to default state gracefully
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-scroll on activeChannel switch
  useEffect(() => {
    if (activeChannelId) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [activeChannelId]);

  // Keep latest messages visible above the software keyboard when typing
  useEffect(() => {
    if (!activeChannelId) return;

    const keyboardShowEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const onKeyboardShow = () => {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 60);
    };

    const sub = Keyboard.addListener(keyboardShowEvent, onKeyboardShow);
    return () => {
      sub.remove();
    };
  }, [activeChannelId]);

  // Mark channel as read and navigate to conversation
  const handleOpenChannel = (channelId: string) => {
    setActiveChannelId(channelId);

    // Update unread count for the opened channel to 0 immediately
    setChannelsList((prev) => {
      const updated = prev.map((ch) => {
        if (ch.id === channelId) {
          return { ...ch, unread: 0 };
        }
        return ch;
      });
      authStorage.saveChatChannels(JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !activeChannelId) return;

    const now = new Date();
    const formattedTime = formatMessageTime(now);

    const newMsg: ChatMessage = {
      id: String(Date.now()),
      sender: "me",
      text: inputText.trim(),
      time: formattedTime,
      timestamp: now.toISOString()
    };

    // 1. Update message history for active channel
    const nextChannelMessages = [...(messages[activeChannelId] || []), newMsg];
    const updatedMessagesMap = {
      ...messages,
      [activeChannelId]: nextChannelMessages
    };
    setMessages(updatedMessagesMap);
    authStorage.saveChatMessages(JSON.stringify(updatedMessagesMap)).catch(() => {});

    // 2. Update channel list preview with latest message text and time
    setChannelsList((prev) => {
      const updated = prev.map((ch) => {
        if (ch.id === activeChannelId) {
          return {
            ...ch,
            subtext: newMsg.text,
            time: formattedTime,
            unread: 0
          };
        }
        return ch;
      });
      authStorage.saveChatChannels(JSON.stringify(updated)).catch(() => {});
      return updated;
    });

    setInputText("");
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 50);
  };

  const activeChannel = channelsList.find((c) => c.id === activeChannelId);

  // If a channel is selected, render the conversation view with message composer
  if (activeChannel) {
    const channelMessages = messages[activeChannel.id] || [];

    return (
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        {/* Active Chat Header */}
        <View style={styles.activeChatHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setActiveChannelId(null)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backButtonText}>&larr; Back</Text>
          </TouchableOpacity>
          <View style={[styles.miniAvatar, { backgroundColor: activeChannel.color }]}>
            <Text style={styles.miniAvatarText}>{activeChannel.initials}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.activeChannelTitle} numberOfLines={1}>
              {activeChannel.name}
            </Text>
            <Text style={styles.activeChannelStatus}>Masked Official Channel</Text>
          </View>
        </View>

        {/* Masked Privacy Ribbon */}
        <View style={styles.channelPrivacyRibbon}>
          <LockIcon size={12} color={colors.primary} />
          <Text style={styles.channelPrivacyRibbonText}>
            End-to-end masked society channel • Personal phone number hidden
          </Text>
        </View>

        {/* Message Thread */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesScroll}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
        >
          {channelMessages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.sender === "me" ? styles.myMessage : styles.theirMessage
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  msg.sender === "me" ? styles.myMessageText : styles.theirMessageText
                ]}
              >
                {msg.text}
              </Text>
              <Text
                style={[
                  styles.messageTime,
                  msg.sender === "me" ? styles.myMessageTime : styles.theirMessageTime
                ]}
              >
                {msg.time}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Interactive Message Composer (Pinned Above Keyboard) */}
        <View style={styles.composerContainer}>
          <TextInput
            style={styles.composerInput}
            placeholder={`Message ${activeChannel.name}...`}
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            returnKeyType="default"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim().length > 0 && styles.sendButtonActive
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
            activeOpacity={0.7}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // Channels List View
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
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
        {channelsList.map((channel, index) => (
          <TouchableOpacity
            key={channel.id}
            style={[
              styles.channelRow,
              index === channelsList.length - 1 && { borderBottomWidth: 0 }
            ]}
            activeOpacity={0.7}
            onPress={() => handleOpenChannel(channel.id)}
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
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: typography.weights.medium
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
  },
  chatContainer: {
    flex: 1,
    backgroundColor: colors.bgPage
  },
  activeChatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  backButton: {
    paddingVertical: 4,
    paddingRight: 10
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: typography.weights.semibold,
    color: colors.primary
  },
  miniAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8
  },
  miniAvatarText: {
    color: "#FFFFFF",
    fontWeight: typography.weights.bold,
    fontSize: 12
  },
  headerInfo: {
    flex: 1
  },
  activeChannelTitle: {
    fontSize: 14,
    fontWeight: typography.weights.bold,
    color: colors.textMain
  },
  activeChannelStatus: {
    fontSize: 10,
    color: colors.textMuted
  },
  channelPrivacyRibbon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(91, 108, 249, 0.06)",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(91, 108, 249, 0.15)"
  },
  channelPrivacyRibbonText: {
    fontSize: 11,
    color: colors.primary,
    marginLeft: 6,
    fontWeight: typography.weights.medium
  },
  messagesScroll: {
    flex: 1
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
    borderBottomRightRadius: 2
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 2
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20
  },
  myMessageText: {
    color: "#FFFFFF"
  },
  theirMessageText: {
    color: colors.textMain
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end"
  },
  myMessageTime: {
    color: "rgba(255, 255, 255, 0.75)"
  },
  theirMessageTime: {
    color: colors.textMuted
  },
  composerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 14 : 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  composerInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: "#F4F6F5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.textMain,
    marginRight: 8
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#D1D5DB"
  },
  sendButtonActive: {
    backgroundColor: colors.primary
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: typography.weights.bold
  }
});
