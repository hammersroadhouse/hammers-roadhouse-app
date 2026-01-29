import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useAuthState } from "../hooks/authStore";
import { theme } from "../lib/theme";

export function RequestScreen() {
  const { user } = useAuthState();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = useMutation(api.djMessages.sendMessageToDJ);
  const userMessages = useQuery(
    api.djMessages.getUserMessages,
    user?.userId ? { userId: user.userId } : "skip"
  );

  if (!user) {
    return null;
  }

  const handleSend = async () => {
    if (!message.trim()) {
      Alert.alert("Error", "Please enter a message");
      return;
    }

    try {
      setLoading(true);
      await sendMessage({
        text: message,
        userId: user.userId,
      });
      setMessage("");
      Alert.alert("Success", "Your request has been sent to the DJ!");
    } catch (error) {
      Alert.alert("Error", "Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="paper-plane" size={24} color={theme.COLORS.primary} />
          <Text style={styles.headerTitle}>Request a Song</Text>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={theme.COLORS.primary} />
          <Text style={styles.infoText}>
            Send your song request directly to the DJ. Spotify search coming soon!
          </Text>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <TextInput
            style={styles.input}
            placeholder="Type your song request here..."
            placeholderTextColor={theme.COLORS.onSurfaceVariant}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={loading || !message.trim()}
            activeOpacity={0.7}
          >
            <Ionicons
              name="send"
              size={20}
              color={theme.COLORS.onPrimary}
              style={styles.sendIcon}
            />
            <Text style={styles.sendButtonText}>
              {loading ? "Sending..." : "Send Request"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Your Requests History */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Your Requests</Text>
          <FlatList
            data={userMessages || []}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.messageItem}>
                <View style={styles.messageHeader}>
                  <Text style={styles.messageTime}>{formatTime(item._creationTime)}</Text>
                  {item.read && (
                    <View style={styles.readBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={theme.COLORS.success} />
                      <Text style={styles.readText}>Seen by DJ</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.messageText}>{item.text}</Text>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="musical-notes" size={48} color={theme.COLORS.surfaceVariant} />
                <Text style={styles.emptyText}>No requests sent yet</Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.background,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.outline,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.COLORS.onSurface,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.COLORS.surface,
    margin: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.COLORS.outline,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: theme.COLORS.onSurfaceVariant,
    lineHeight: 18,
  },
  inputSection: {
    paddingHorizontal: 16,
    gap: 12,
  },
  input: {
    backgroundColor: theme.COLORS.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.COLORS.onSurface,
    minHeight: 120,
    borderWidth: 1,
    borderColor: theme.COLORS.outline,
  },
  sendButton: {
    backgroundColor: theme.COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendIcon: {
    marginRight: -4,
  },
  sendButtonText: {
    color: theme.COLORS.onPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  historySection: {
    flex: 1,
    marginTop: 24,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.COLORS.onSurface,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  messageItem: {
    backgroundColor: theme.COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.COLORS.outline,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  messageTime: {
    fontSize: 12,
    color: theme.COLORS.onSurfaceVariant,
  },
  readBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  readText: {
    fontSize: 12,
    color: theme.COLORS.success,
    fontWeight: "500",
  },
  messageText: {
    fontSize: 15,
    color: theme.COLORS.onSurface,
    lineHeight: 22,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: theme.COLORS.onSurfaceVariant,
    marginTop: 16,
  },
});