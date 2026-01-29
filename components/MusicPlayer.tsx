import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, useWindowDimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRadioPlayer } from '../hooks/useRadioPlayer';
import { theme } from '../lib/theme';

const { COLORS: colors, SPACING: spacing, TYPOGRAPHY: typography, RADIUS: borderRadius } = theme;

export const MusicPlayer: React.FC = () => {
  const { playerState, setVolume, toggleMute } = useRadioPlayer();
  const { currentSong, volume, isMuted, isPlaying } = playerState;
  const { width } = useWindowDimensions();
  
  const displayVolume = isMuted ? 0 : volume;
  const albumSize = Math.min(width * 0.7, 300);

  return (
    <ScrollView 
      style={styles.scrollContainer}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* LIVE Indicator */}
      <View style={styles.liveContainer}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>LIVE</Text>
      </View>

      {/* Album Art */}
      <View style={styles.albumContainer}>
        <Image
          source={{ uri: currentSong?.albumArt }}
          style={[styles.albumArt, { width: albumSize, height: albumSize }]}
        />
      </View>

      {/* Song Info */}
      <View style={styles.infoContainer}>
        <Text
          style={styles.title}
          numberOfLines={2}
        >
          {currentSong?.title || 'Stream Loading...'}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {currentSong?.artist || 'Live Stream'}
        </Text>
      </View>

      {/* Controls Section */}
      <View style={styles.controlsContainer}>
        {/* Volume Slider */}
        <View style={styles.volumeRow}>
          <Ionicons
            name="volume-low"
            size={20}
            color={colors.onSurface}
          />
          <View style={styles.sliderContainer}>
            {/* Custom slider visualization */}
            <View style={styles.sliderTrack}>
              <View
                style={[
                  styles.sliderFill,
                  { width: `${displayVolume * 100}%` },
                ]}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.sliderThumb,
                { left: `${displayVolume * 100}%` },
              ]}
              onPress={(event: any) => {
                const { locationX } = event.nativeEvent;
                const percentage = locationX / (width - spacing.lg * 2 - 40);
                setVolume(Math.max(0, Math.min(1, percentage)));
              }}
              activeOpacity={0.7}
            />
          </View>
          <Ionicons
            name="volume-high"
            size={20}
            color={colors.primary}
          />
        </View>

        {/* Play/Pause Button */}
        <TouchableOpacity
          style={styles.playButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={32}
            color={colors.onPrimary}
          />
          <Text style={styles.playButtonText}>
            {isPlaying ? 'Pause' : 'Play'}
          </Text>
        </TouchableOpacity>

        {/* Mute Button */}
        <TouchableOpacity
          style={styles.muteButton}
          onPress={toggleMute}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isMuted ? 'volume-mute' : 'volume-off'}
            size={28}
            color={isMuted ? colors.primary : colors.onSurface}
          />
          <Text style={styles.muteButtonText}>
            {isMuted ? 'Unmute' : 'Mute'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Status Indicator */}
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.liveIndicator,
            {
              opacity: isPlaying ? 1 : 0.6,
            },
          ]}
        >
          <View
            style={[
              styles.liveDot,
              isPlaying && styles.liveDotPulsing,
            ]}
          />
          <Text style={styles.liveText}>
            {isPlaying ? 'LIVE' : 'STREAM OFFLINE'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  liveContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.error,
  },
  liveDotPulsing: {
    opacity: 0.8,
  },
  liveText: {
    ...typography.label,
    color: colors.onSurface,
    fontWeight: '700',
    letterSpacing: 1,
  },
  albumContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  albumArt: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.heading3,
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  artist: {
    ...typography.body,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  controlsContainer: {
    gap: spacing.lg,
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
  },
  sliderContainer: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 4,
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  sliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    marginLeft: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  playButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  playButtonText: {
    ...typography.body,
    color: colors.onPrimary,
    fontWeight: '600',
  },
  muteButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 2,
    borderColor: colors.surfaceVariant,
  },
  muteButtonText: {
    ...typography.body,
    color: colors.onSurface,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.errorLight,
    borderRadius: borderRadius.full,
  },
});