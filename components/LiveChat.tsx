import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';
import { theme } from '../lib/theme';

interface ChatMessage {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
  isOwn?: boolean;
}

interface LiveChatProps {
  username: string;
  userId: Id<"users">;
}

export const LiveChat = React.memo(function LiveChat({ username, userId }: LiveChatProps) {
  const messagesData = useQuery(api.messages.getMessages, {});
  const sendMessage = useMutation(api.messages.sendMessage);
  const [inputText, setInputText] = useState('');

  // Transform Convex messages to ChatMessage format
  const messages: ChatMessage[] = messagesData?.map((msg: any) => ({
    id: msg._id,
    author: msg.author,
    text: msg.text,
    timestamp: new Date(msg._creationTime),
    isOwn: msg.userId === userId,
  })) || [];

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim()) return;

    try {
      await sendMessage({
        text: inputText,
        userId,
      });
      setInputText('');
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  }, [inputText, userId, sendMessage]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return date.toLocaleDateString();
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.messageRow,
        item.isOwn && styles.messageRowOwn,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          item.isOwn && styles.messageBubbleOwn,
        ]}
      >
        {!item.isOwn && (
          <Text style={styles.authorName}>{item.author}</Text>
        )}
        <Text
          style={[
            styles.messageText,
            item.isOwn && styles.messageTextOwn,
          ]}
        >
          {item.text}
        </Text>
        <Text
          style={[
            styles.timestamp,
            item.isOwn && styles.timestampOwn,
          ]}
        >
          {formatTime(item.timestamp)}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="chat-multiple"
          size={24}
          color={theme.COLORS.primary}
        />
        <Text style={styles.headerTitle}>Live Chat</Text>
        <View style={styles.onlineIndicator}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>142 online</Text>
        </View>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item: ChatMessage) => item.id}
        contentContainerStyle={styles.messagesList}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="chat-outline"
              size={48}
              color={theme.COLORS.surfaceVariant}
            />
            <Text style={styles.emptyText}>No messages yet</Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Send a message..."
          placeholderTextColor={theme.COLORS.onSurfaceVariant}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          editable={true}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSendMessage}
          disabled={!inputText.trim()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="send"
            size={20}
            color={inputText.trim() ? theme.COLORS.onPrimary : theme.COLORS.disabled}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.SPACING.md,
    paddingVertical: theme.SPACING.md,
    backgroundColor: theme.COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.surfaceVariant,
    gap: theme.SPACING.md,
  },
  headerTitle: {
    flex: 1,
    ...theme.TYPOGRAPHY.heading3,
    color: theme.COLORS.onSurface,
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.SPACING.xs,
    backgroundColor: theme.COLORS.errorLight,
    paddingHorizontal: theme.SPACING.sm,
    paddingVertical: theme.SPACING.xs,
    borderRadius: theme.RADIUS.full,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: theme.RADIUS.full,
    backgroundColor: theme.COLORS.error,
  },
  onlineText: {
    ...theme.TYPOGRAPHY.label,
    color: theme.COLORS.onSurface,
    fontWeight: '600',
  },
  messagesList: {
    paddingHorizontal: theme.SPACING.md,
    paddingVertical: theme.SPACING.md,
    gap: theme.SPACING.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.SPACING.xxl,
  },
  emptyText: {
    ...theme.TYPOGRAPHY.body,
    color: theme.COLORS.onSurfaceVariant,
    marginTop: theme.SPACING.md,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: theme.SPACING.sm,
  },
  messageRowOwn: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '85%',
    backgroundColor: theme.COLORS.surface,
    borderRadius: theme.RADIUS.lg,
    paddingHorizontal: theme.SPACING.md,
    paddingVertical: theme.SPACING.sm,
    borderBottomLeftRadius: 4,
  },
  messageBubbleOwn: {
    backgroundColor: theme.COLORS.primary,
    borderBottomLeftRadius: theme.RADIUS.lg,
    borderBottomRightRadius: 4,
  },
  authorName: {
    ...theme.TYPOGRAPHY.label,
    color: theme.COLORS.onSurfaceVariant,
    marginBottom: theme.SPACING.xs,
    fontWeight: '600',
  },
  messageText: {
    ...theme.TYPOGRAPHY.body,
    color: theme.COLORS.onSurface,
  },
  messageTextOwn: {
    color: theme.COLORS.onPrimary,
  },
  timestamp: {
    ...theme.TYPOGRAPHY.label,
    color: theme.COLORS.onSurfaceVariant,
    marginTop: theme.SPACING.xs,
    alignSelf: 'flex-end',
  },
  timestampOwn: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: theme.SPACING.md,
    paddingVertical: theme.SPACING.md,
    backgroundColor: theme.COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: theme.COLORS.surfaceVariant,
    gap: theme.SPACING.sm,
  },
  input: {
    flex: 1,
    backgroundColor: theme.COLORS.background,
    borderRadius: theme.RADIUS.lg,
    paddingHorizontal: theme.SPACING.md,
    paddingVertical: theme.SPACING.md,
    ...theme.TYPOGRAPHY.body,
    color: theme.COLORS.onSurface,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: theme.RADIUS.lg,
    backgroundColor: theme.COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: theme.COLORS.surface,
    borderWidth: 1,
    borderColor: theme.COLORS.surfaceVariant,
  },
});