import React from 'react';
import { View, FlatList, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { theme } from '../lib/theme';

const { COLORS, SPACING, TYPOGRAPHY, RADIUS } = theme;

interface RequestListProps {
  userId: string;
}

export function RequestList({ userId }: RequestListProps) {
  const requests = useQuery(
    api.requests.getUserRequests,
    userId ? { userId } : ('skip' as any),
  );

  const clearRequests = useMutation(api.requests.clearUserRequests);

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Requests',
      'Are you sure you want to clear all your requests? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearRequests({ userId });
              Alert.alert('Success', 'All requests cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear requests');
            }
          },
        },
      ],
    );
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return COLORS.primary;
      case 'played':
        return '#4CAF50';
      default:
        return COLORS.onSurfaceVariant;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return 'checkmark-circle';
      case 'played':
        return 'play-circle';
      default:
        return 'time';
    }
  };

  const renderRequest = ({ item }: { item: any }) => (
    <View style={styles.requestCard}>
      <Image source={{ uri: item.albumArt }} style={styles.albumArt} />
      <View style={styles.requestInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
        {item.album && (
          <Text style={styles.songAlbum} numberOfLines={1}>
            {item.album} • {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
          </Text>
        )}
        <Text style={styles.timestamp}>{formatTimestamp(item._creationTime)}</Text>
      </View>
      <View style={styles.statusContainer}>
        <Ionicons
          name={getStatusIcon(item.status) as any}
          size={24}
          color={getStatusColor(item.status)}
        />
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
      </View>
    </View>
  );

  if (requests === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {requests && requests.length > 0 && (
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item: any) => item._id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="musical-note-outline" size={64} color={COLORS.onSurfaceVariant} />
            <Text style={styles.emptyText}>No requests yet</Text>
            <Text style={styles.emptySubtext}>Search and request songs from the Search tab</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.outline,
  },
  clearButtonText: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.error,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  listContainer: {
    padding: SPACING.md,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.outline,
  },
  albumArt: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.sm,
  },
  requestInfo: {
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  songTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
    color: COLORS.onBackground,
    marginBottom: 2,
  },
  songArtist: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.onSurfaceVariant,
    marginBottom: 2,
  },
  songAlbum: {
    ...TYPOGRAPHY.label,
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    marginBottom: 4,
  },
  timestamp: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    ...TYPOGRAPHY.labelSmall,
    fontSize: 10,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
    color: COLORS.onBackground,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});