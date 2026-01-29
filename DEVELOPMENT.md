// ============================================================================
// RADIO STREAMING APP - ARCHITECTURE & DEVELOPMENT GUIDE
// ============================================================================
//
// PROJECT STRUCTURE
// ├── App.tsx                          Main entry point with tab navigation
// ├── screens/
// │   ├── PlayerScreen.tsx             Live music player screen
// │   ├── ChatScreen.tsx               Live chat interface
// │   └── RecentlyPlayedScreen.tsx     Song history list
// ├── components/
// │   ├── MusicPlayer.tsx              Player UI (album art, volume, mute)
// │   ├── LiveChat.tsx                 Chat interface with messages
// │   └── RecentlyPlayedList.tsx       Song list display
// ├── hooks/
// │   └── useRadioPlayer.ts            Player state & control logic
// ├── lib/
// │   ├── theme.ts                     Design tokens (colors, spacing, typography)
// │   └── musickit.ts                  Apple MusicKit integration
// ├── types/
// │   └── index.ts                     Shared TypeScript interfaces
// └── .a0/
//     ├── general.yaml                 App metadata & store info
//     ├── build.yaml                   Build settings
//     └── monetization.yaml            In-app purchases & subscriptions
//
// ============================================================================
// KEY FEATURES IMPLEMENTED
// ============================================================================
//
// 1. MUSIC PLAYER (PlayerScreen)
//    - Displays album artwork with shadow effects
//    - Shows song title & artist name
//    - Volume slider with real-time percentage display
//    - Mute button (toggles between muted/unmuted)
//    - LIVE status indicator
//    - No play/pause button (continuous streaming)
//
// 2. LIVE CHAT (ChatScreen)
//    - Real-time message display
//    - User message input with character limit (500)
//    - Online user counter
//    - Timestamp formatting (now, Xm, Xh)
//    - Own messages highlighted in primary color
//    - Responsive to keyboard on iOS
//
// 3. RECENTLY PLAYED (RecentlyPlayedScreen)
//    - Song cards with album art thumbnail
//    - Numbered index badges
//    - Song title, artist, duration
//    - Play button for each track (for future action)
//    - Last 50 songs tracking
//
// ============================================================================
// NEXT STEPS - APPLE MUSICKIT INTEGRATION
// ============================================================================
//
// STEP 1: Get API Credentials
//   - Go to https://developer.apple.com/account
//   - Create MusicKit private key (p8 file)
//   - Generate developer token (for server auth)
//   - Configure Music ID
//
// STEP 2: Install MusicKit Package
//   - expo install @apple/musickit-js (if using web bridge)
//   - Or use native iOS modules with expo-modules
//
// STEP 3: Implement Streaming
//   - Update hooks/useRadioPlayer.ts with real track data
//   - Call setDeveloperToken() in App.tsx on startup
//   - Connect volume control to native audio player
//   - Stream HLS URLs from MusicKit API
//
// STEP 4: Handle Authentication
//   - Implement user authorization flow
//   - Store musicUserToken securely (AsyncStorage encrypted)
//   - Refresh tokens on expiry
//
// STEP 5: Add Chat Backend
//   - Connect to WebSocket server for real-time messages
//   - Or use Firebase Realtime Database
//   - Implement user authentication for chat
//
// ============================================================================
// DESIGN SYSTEM
// ============================================================================
//
// COLORS (lib/theme.ts)
//   Primary: #FF5722 (Vibrant Orange) - Main brand color
//   Secondary: #1F1F1F (Dark) - Supporting color
//   Surface: #F5F5F5 (Light Gray) - Component backgrounds
//   Error: #B3261E (Red) - Status indicators (LIVE dot)
//
// SPACING (8px base unit)
//   xs: 4px    | sm: 8px   | md: 16px
//   lg: 24px   | xl: 32px  | xxl: 48px
//
// TYPOGRAPHY
//   h1: 32px bold    | h2: 28px bold  | h3: 24px semibold
//   body: 16px       | bodySmall: 14px | label: 12px medium
//
// RADIUS
//   sm: 4px | md: 8px | lg: 12px | xl: 16px | full: 999px
//
// ============================================================================
// TESTING CHECKLIST
// ============================================================================
//
// [ ] Volume slider responds to touch
// [ ] Mute button toggles volume display
// [ ] Chat input appears on keyboard show
// [ ] Recently played list scrolls smoothly
// [ ] Tab navigation works on all tabs
// [ ] Safe area applied (notch/home indicator)
// [ ] Album art loads and displays correctly
// [ ] Message timestamps update correctly
// [ ] Send button disabled when input empty
// [ ] 142 online users display shows in chat
//
// ============================================================================
// COMMON TASKS
// ============================================================================
//
// Add new feature to Player:
//   1. Update hooks/useRadioPlayer.ts (state + logic)
//   2. Add UI to components/MusicPlayer.tsx
//   3. Connect via screens/PlayerScreen.tsx
//
// Modify colors/spacing:
//   1. Edit lib/theme.ts
//   2. Use colors.primary, spacing.md in StyleSheet
//   3. Avoid hardcoded values
//
// Add chat backend:
//   1. Create lib/chatService.ts
//   2. Update components/LiveChat.tsx
//   3. Add WebSocket/Firebase listeners
//
// Stream real music:
//   1. Get MusicKit token
//   2. Update hooks/useRadioPlayer.ts with API calls
//   3. Replace sample data with real catalog
//
// ============================================================================