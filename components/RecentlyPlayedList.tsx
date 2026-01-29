import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../lib/theme';
import { Song } from '../hooks/useRadioPlayer';

interface RecentlyPlayedProps {
  songs: Song[];
}

export const RecentlyPlayedList = React.memo(function RecentlyPlayedList({
  songs,
}: RecentlyPlayedProps) {
  const renderSongItem = ({ item, index }: { item: Song; index: number }) => (
    <TouchableOpacity
      style={styles.songCard}
      activeOpacity={0.7}
    >
      <View style={styles.indexBadge}>
        <Text style={styles.indexText}>{index + 1}</Text>
      </View>

      <Image
        source={{ uri: item.albumArt }}
        style={styles.thumbnail}
      />

      <View style={styles.songInfo}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {item.artist}
        </Text>
        <Text style={styles.duration}>
          {formatDuration(item.duration)}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.playButton}
        activeOpacity={0.6}
      >
        <MaterialCommunityIcons
          name="play-circle"
          size={28}
          color={theme.COLORS.primary}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MaterialCommunityIcons
            name="history"
            size={24}
            color={theme.COLORS.primary}
          />
          <Text style={styles.headerTitle}>Recently Played</Text>
        </View>
        {songs.length > 0 && (
          <Text style={styles.count}>{songs.length}</Text>
        )}
      </View>

      <FlatList
        data={songs}
        renderItem={renderSongItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        scrollEnabled={true}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="music-box-outline"
              size={48}
              color={theme.COLORS.surfaceVariant}
            />
            <Text style={styles.emptyTitle}>No Recently Played</Text>
            <Text style={styles.emptySubtitle}>
              Songs will appear here as they play
            </Text>
          </View>
        }
      />
    </View>
  );
});

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.SPACING.md,
    paddingVertical: theme.SPACING.md,
    backgroundColor: theme.COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.surfaceVariant,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.SPACING.md,
  },
  headerTitle: {
    ...theme.TYPOGRAPHY.heading3,
    color: theme.COLORS.onSurface,
  },
  count: {
    ...theme.TYPOGRAPHY.label,
    color: theme.COLORS.onSurfaceVariant,
    backgroundColor: theme.COLORS.surfaceVariant,
    paddingHorizontal: theme.SPACING.sm,
    paddingVertical: theme.SPACING.xs,
    borderRadius: theme.RADIUS.full,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: theme.SPACING.md,
    paddingVertical: theme.SPACING.md,
    gap: theme.SPACING.md,
  },
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.surface,
    borderRadius: theme.RADIUS.lg,
    paddingHorizontal: theme.SPACING.md,
    paddingVertical: theme.SPACING.sm,
    gap: theme.SPACING.md,
  },
  indexBadge: {
    width: 32,
    height: 32,
    borderRadius: theme.RADIUS.md,
    backgroundColor: theme.COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indexText: {
    ...theme.TYPOGRAPHY.label,
    color: theme.COLORS.onPrimary,
    fontWeight: '700',
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: theme.RADIUS.md,
    backgroundColor: theme.COLORS.surfaceVariant,
  },
  songInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...theme.TYPOGRAPHY.body,
    color: theme.COLORS.onSurface,
    fontWeight: '600',
    marginBottom: theme.SPACING.xs,
  },
  artist: {
    ...theme.TYPOGRAPHY.bodySmall,
    color: theme.COLORS.onSurfaceVariant,
    marginBottom: theme.SPACING.xs,
  },
  duration: {
    ...theme.TYPOGRAPHY.label,
    color: theme.COLORS.onSurfaceVariant,
  },
  playButton: {
    padding: theme.SPACING.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.SPACING.xxl,
  },
  emptyTitle: {
    ...theme.TYPOGRAPHY.heading3,
    color: theme.COLORS.onSurface,
    marginTop: theme.SPACING.md,
  },
  emptySubtitle: {
    ...theme.TYPOGRAPHY.body,
    color: theme.COLORS.onSurfaceVariant,
    marginTop: theme.SPACING.sm,
    textAlign: 'center',
  },
});