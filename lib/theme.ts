import { StyleSheet } from 'react-native';

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const COLORS = {
  // Primary brand
  primary: '#FF5722',
  primaryDark: '#E64A19',
  primaryLight: '#FF7043',
  onPrimary: '#FFFFFF',

  // Background & Surfaces (Dark Theme)
  background: '#0F0F0F', // Deep black
  surface: '#1A1A1A', // Dark gray for cards/elevated
  surfaceVariant: '#2A2A2A', // Slightly lighter for secondary surfaces
  surfaceLight: '#333333', // For hover/pressed states

  // Text & Borders
  onBackground: '#FFFFFF', // White text
  onSurface: '#E0E0E0', // Light gray text
  onSurfaceVariant: '#B0B0B0', // Muted gray for secondary text
  outline: '#404040', // Dark borders
  outlineVariant: '#555555', // Lighter borders

  // Status & Semantic
  success: '#4CAF50',
  error: '#FF5252',
  errorLight: '#FF6B6B',
  warning: '#FFB74D',
  disabled: '#424242',
  disabledText: '#666666',

  // Chat specific
  userMessage: '#FF5722',
  otherMessage: '#2A2A2A',
  onlineIndicator: '#FF5252',
};

const TYPOGRAPHY = {
  heading1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  heading2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 30,
  },
  heading3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 26,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 16,
  },
};

const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 999,
};

const SHADOWS = {
  none: {},
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 10.32,
    elevation: 13,
  },
};

const themeStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
  },
  contentContainer: {
    flexGrow: 1,
    paddingVertical: SPACING.md,
  },
});

export const theme = {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  RADIUS,
  SHADOWS,
  styles: themeStyles,
};