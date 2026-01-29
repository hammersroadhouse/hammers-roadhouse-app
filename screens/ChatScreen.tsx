import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { theme } from '../lib/theme';
import { LiveChat } from '../components/LiveChat';
import { useAuthState } from '../hooks/authStore';

export function ChatScreen() {
  const { user } = useAuthState();

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <LiveChat username={user.username} userId={user.userId} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.background,
  },
});