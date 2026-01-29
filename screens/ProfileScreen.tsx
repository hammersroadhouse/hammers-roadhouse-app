import React, { useState } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthState } from '../hooks/authStore';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Avatar, AVATAR_COLORS } from '../components/Avatar';
import { theme } from '../lib/theme';

export default function ProfileScreen() {
  const { user } = useAuthState();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const updateAvatarColor = useMutation(api.auth.updateAvatarColor);
  const userData = useQuery(api.auth.getUser, user?.userId ? { userId: user.userId } : 'skip');

  const currentColor = userData?.avatarColor || AVATAR_COLORS[0];

  const handleColorSelect = async (color: string) => {
    if (!user?.userId) return;

    try {
      setSelectedColor(color);
      await updateAvatarColor({ userId: user.userId, color });
      Alert.alert('Success', 'Avatar color updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update avatar color');
      setSelectedColor(null);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Please log in to view your profile</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Profile</Text>
        </View>

        {/* Avatar Preview */}
        <View style={styles.avatarPreview}>
          <Avatar
            firstName={userData.firstName}
            username={userData.username}
            color={selectedColor || currentColor}
            size="large"
          />
          <View style={styles.previewInfo}>
            <Text style={styles.previewName}>{userData.firstName}</Text>
            <Text style={styles.previewUsername}>@{userData.username}</Text>
            <Text style={styles.previewEmail}>{userData.email}</Text>
          </View>
        </View>

        {/* Avatar Color Selection */}
        <View style={styles.colorSection}>
          <Text style={styles.sectionTitle}>Avatar Color</Text>
          <Text style={styles.sectionDescription}>
            Choose a color for your avatar badge
          </Text>

          <View style={styles.colorGrid}>
            {AVATAR_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  {
                    backgroundColor: color,
                    borderWidth: currentColor === color ? 3 : 0,
                    borderColor:
                      currentColor === color ? theme.COLORS.onSurface : 'transparent',
                  },
                ]}
                onPress={() => handleColorSelect(color)}
                activeOpacity={0.7}
              >
                {currentColor === color && (
                  <Ionicons name="checkmark" size={20} color={theme.COLORS.background} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Account Info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Account Information</Text>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>First Name</Text>
            <Text style={styles.infoValue}>{userData.firstName}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Username</Text>
            <Text style={styles.infoValue}>@{userData.username}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{userData.email}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.background,
  },
  content: {
    paddingBottom: 32,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: theme.COLORS.onSurfaceVariant,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.outline,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.COLORS.onSurface,
  },
  avatarPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: theme.COLORS.surface,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.COLORS.outline,
  },
  previewInfo: {
    marginLeft: 16,
    flex: 1,
  },
  previewName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.COLORS.onSurface,
    marginBottom: 4,
  },
  previewUsername: {
    fontSize: 14,
    color: theme.COLORS.primary,
    marginBottom: 4,
  },
  previewEmail: {
    fontSize: 12,
    color: theme.COLORS.onSurfaceVariant,
  },
  colorSection: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.COLORS.onSurface,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: theme.COLORS.onSurfaceVariant,
    marginBottom: 16,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  infoItem: {
    backgroundColor: theme.COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.COLORS.outline,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.COLORS.onSurfaceVariant,
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: theme.COLORS.onSurface,
    fontWeight: '500',
  },
});