import React, { useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from 'convex/react';

import { api } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';
import { theme } from '../lib/theme';
import { useMusicSearch } from '../hooks/useMusicSearch';
import type { AppleMusicSong } from '../types';

const { COLORS, SPACING, TYPOGRAPHY, RADIUS } = theme;

interface MusicSearchProps {
  userId: Id<'users'>;
}

export function MusicSearch({ userId }: MusicSearchProps) {
  // Single source of truth for query/results.
  const { results, isLoading, searchAppleMusic, clearSearch, searchQuery, setSearchQuery } =
    useMusicSearch();

  const submitRequest = useMutation(api.requests.submitRequest);
  const [submittingSongId, setSubmittingSongId] = useState<string | null>(null);

  const handleSearchTextChange = (text: string) => {
    // Keep input controlled (instant UI response).
    setSearchQuery(text);

    if (text.trim()) {
      searchAppleMusic(text);
      return;
    }

    // If the user cleared the input, clear the list immediately.
    clearSearch();
  };

  const handleRequestSong = async (song: AppleMusicSong) => {
    try {
      setSubmittingSongId(song.id);

      await submitRequest({
        songId: song.id,
        title: song.title,
        artist: song.artist,
        albumArt: song.albumArt,
        album: song.album,
        duration: song.duration,
        userId,
      });

      // Android note: showing Alert before state updates can prevent the list from visually clearing.
      // We clear first, then show the success message on the next tick.
      Keyboard.dismiss();
      clearSearch();

      setTimeout(() => {
        Alert.alert(
          'Request Submitted! 🎵',
          `"${song.title}" has been added to the request queue.`
        );
      }, 0);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit request. Please try again.');
    } finally {
      setSubmittingSongId(null);
    }
  };

  const renderSong = ({ item }: { item: AppleMusicSong }) => (
    <View style={styles.songCard}>
      <Image source={{ uri: item.albumArt }} style={styles.albumArt} />

      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {item.artist}
        </Text>
        {item.album ? (
          <Text style={styles.songAlbum} numberOfLines={1}>
            {item.album}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity
        style={[styles.addButton, submittingSongId === item.id && styles.addButtonDisabled]}
        onPress={() => handleRequestSong(item)}
        disabled={submittingSongId === item.id}
      >
        {submittingSongId === item.id ? (
          <ActivityIndicator size="small" color={COLORS.onPrimary} />
        ) : (
          <Ionicons name="add" size={24} color={COLORS.onPrimary} />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={COLORS.onSurfaceVariant}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Apple Music..."
          placeholderTextColor={COLORS.onSurfaceVariant}
          value={searchQuery}
          onChangeText={handleSearchTextChange}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderSong}
          keyExtractor={(item: AppleMusicSong) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="musical-notes-outline" size={64} color={COLORS.onSurfaceVariant} />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No results found' : 'Search for a song to request'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.outline,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.onBackground,
    paddingVertical: SPACING.md,
  },
  listContainer: {
    padding: SPACING.md,
    paddingTop: 0,
  },
  songCard: {
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
  songInfo: {
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
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...TYPOGRAPHY.body,
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
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
});