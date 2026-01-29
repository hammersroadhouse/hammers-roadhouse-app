import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AvatarProps {
  firstName?: string;
  username?: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
}

const DEFAULT_COLORS = [
  '#FF5722', // Orange Red
  '#FF9800', // Orange
  '#FFC107', // Amber
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#9C27B0', // Purple
  '#E91E63', // Pink
  '#00BCD4', // Cyan
  '#795548', // Brown
  '#607D8B', // Blue Grey
] as const;

type AvatarSize = NonNullable<AvatarProps['size']>;

const SIZE_MAP: Record<AvatarSize, number> = {
  small: 32,
  medium: 48,
  large: 64,
};

const TEXT_SIZE_MAP: Record<AvatarSize, number> = {
  small: 12,
  medium: 16,
  large: 24,
};

export function Avatar({
  firstName,
  username,
  color = DEFAULT_COLORS[0],
  size = 'medium',
}: AvatarProps) {
  const safeFirst = (firstName ?? '').trim();
  const safeUser = (username ?? '').trim();

  const firstInitial = safeFirst.length > 0 ? safeFirst[0] : '';
  const userInitial = safeUser.length > 0 ? safeUser[0] : '';

  const initials = (firstInitial + userInitial || '?').toUpperCase();

  const sizeValue = SIZE_MAP[size];
  const fontSize = TEXT_SIZE_MAP[size];

  return (
    <View
      style={[
        styles.avatar,
        {
          width: sizeValue,
          height: sizeValue,
          borderRadius: sizeValue / 2,
          backgroundColor: color,
        },
      ]}
    >
      <Text style={[styles.text, { fontSize }]}>{initials}</Text>
    </View>
  );
}

export const AVATAR_COLORS = [...DEFAULT_COLORS];

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF5722',
  },
  text: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});