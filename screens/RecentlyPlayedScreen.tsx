import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { RecentlyPlayedList } from '../components/RecentlyPlayedList';
import { useRadioPlayer } from '../hooks/useRadioPlayer';
import { theme } from '../lib/theme';

export default function RecentlyPlayedScreen() {
  const { recentlyPlayed } = useRadioPlayer();

  return (
    <SafeAreaView style={styles.container}>
      <RecentlyPlayedList songs={recentlyPlayed} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.background,
  },
});