import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MusicPlayer } from '../components/MusicPlayer';
import { theme } from '../lib/theme';

export default function PlayerScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hammers Road House</Text>
        <Text style={styles.headerSubtitle}>Powered by Blast Radio</Text>
      </View>
      <View style={styles.content}>
        <MusicPlayer />
      </View>
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
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.COLORS.onSurface,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.COLORS.onSurfaceVariant,
  },
  content: {
    flex: 1,
  },
});