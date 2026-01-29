import React from 'react';
import { View, Text, SafeAreaView, StyleSheet, FlatList } from 'react-native';
import { useRadioPlayer } from '../hooks/useRadioPlayer';
import { Avatar } from '../components/Avatar';
import { theme } from '../lib/theme';

interface Listener {
  username: string;
  firstName: string;
  avatarColor?: string;
}

export default function ListenersScreen() {
  const { activeListenerCount, activeListeners } = useRadioPlayer();

  return (
    <SafeAreaView style={styles.container}>
      {activeListeners.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>🎧</Text>
          </View>
          <Text style={styles.emptyText}>No active listeners right now</Text>
          <Text style={styles.emptySubtext}>Be the first to tune in!</Text>
        </View>
      ) : (
        <FlatList
          data={activeListeners}
          keyExtractor={(item, index) => `${item.username}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.listenerItem}>
              <Avatar
                firstName={item.firstName}
                username={item.username}
                color={item.avatarColor}
                size="medium"
              />
              <View style={styles.listenerInfo}>
                <Text style={styles.listenerName}>{item.firstName}</Text>
                <Text style={styles.listenerUsername}>@{item.username}</Text>
              </View>
              <View style={styles.onlineBadge}>
                <View style={styles.onlineDot} />
              </View>
            </View>
          )}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Active Listeners</Text>
              <Text style={styles.headerCount}>
                🎧 {activeListenerCount} {activeListenerCount === 1 ? 'Listener' : 'Listeners'}
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.outline,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.COLORS.onSurface,
    marginBottom: 8,
  },
  headerCount: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.COLORS.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.COLORS.onSurfaceVariant,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.COLORS.onSurfaceVariant,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  listenerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.COLORS.outline,
  },
  listenerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  listenerName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.COLORS.onSurface,
    marginBottom: 2,
  },
  listenerUsername: {
    fontSize: 13,
    color: theme.COLORS.onSurfaceVariant,
  },
  onlineBadge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.COLORS.success,
  },
});