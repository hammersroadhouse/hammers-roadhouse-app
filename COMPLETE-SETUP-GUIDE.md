# 🎸 Hammers Road House - Complete Setup Guide

## What You Have Now

### ✅ Mobile App (Listeners)
A complete React Native radio streaming app with:
- **Live Player** - Streams from Blast Radio with volume control & mute
- **Live Chat** - Real-time chat interface (ready for backend)
- **Request Songs** - Search Apple Music & submit requests
- **Your Requests** - See your request history with status (Pending → Approved → Played)

### ✅ DJ Dashboard (Host Only)
A web-based control panel with:
- **View All Requests** - See every song request from all listeners
- **Manage Queue** - Approve, mark as played, or delete requests
- **Real-Time Stats** - Pending, approved, played counts
- **Filters** - View by status (All, Pending, Approved, Played)
- **Auto-Refresh** - Updates every 5 seconds

### ✅ Backend (Convex)
Real-time database with:
- Song request storage
- Status tracking (pending/approved/played)
- User request history
- Instant sync across all devices

---

## Quick Start

### 1. DJ Dashboard Setup (5 minutes)

**Open `dj-dashboard.html` and replace:**
```javascript
const CONVEX_URL = "YOUR_CONVEX_URL";
```

**With:**
```javascript
const CONVEX_URL = "https://resilient-warbler-266.convex.cloud";
```

**Then open the file in your browser or host it:**
- **Easiest**: Just open `dj-dashboard.html` in Chrome/Firefox
- **Better**: Upload to [Netlify Drop](https://app.netlify.com/drop)
- **Pro**: Use Vercel or GitHub Pages (see DJ-DASHBOARD-SETUP.md)

**Dashboard URL**: `file:///path/to/dj-dashboard.html` (or your hosted URL)

---

### 2. Mobile App - Enable Real Apple Music Search

**Currently**: The app uses mock Apple Music data

**To enable real search:**

1. **Get Apple Music API Token**
- Go to [Apple Developer Console](https://developer.apple.com/account)
- Create a MusicKit Identifier
- Generate a Developer Token (JWT)

2. **Update the search hook**
- Open `hooks/useMusicSearch.ts`
- Find line ~50 (PRODUCTION CODE section)
- Uncomment the production code
- Replace `YOUR_APPLE_MUSIC_DEVELOPER_TOKEN` with your token
- Comment out the mock data section

3. **Install required package**
```bash
npx expo install expo-av
```

**Guide**: See `lib/musickit.ts` and `SETUP.md` for detailed instructions

---

### 3. Live Audio Streaming Setup

**Currently**: Player UI is ready, audio streaming is prepared but not active

**To enable streaming:**

1. **Install expo-av**
```bash
npx expo install expo-av
```

2. **Update player hook**
- Open `hooks/useRadioPlayer.ts`
- Find the `// Production streaming` section (~line 30)
- Uncomment the audio code
- The stream URL is already set: `https://www.blastradio.com/jacksonhammer`

3. **Test on device** (audio doesn't work in simulator)

---

## Complete Flow Example

### Listener Experience
1. Opens app → Sees player with current song (from Apple Music)
2. Taps "Request" tab → Searches "Bohemian Rhapsody"
3. Taps [+] on song → Request submitted to backend
4. Switches to "Your Requests" → Sees request with "Pending" status
5. DJ approves it → Status changes to "Approved" (orange)
6. DJ plays the song → Status changes to "Played" (green)

### DJ Experience
1. Opens DJ Dashboard in browser
2. Sees "Bohemian Rhapsody" request from "John" (Pending)
3. Clicks "✓ Approve" → Moves to approved queue (orange badge)
4. Plays the song on Blast Radio stream
5. Clicks "▶ Mark Played" → Moves to played history (green badge)
6. Dashboard auto-refreshes every 5 seconds with new requests

---

## File Structure

```
Hammers Road House/
├── App.tsx                    # Main app entry
├── screens/
│   ├── PlayerScreen.tsx       # Live player tab
│   ├── ChatScreen.tsx         # Chat tab
│   ├── RequestScreen.tsx      # Request tab (Search + Your Requests)
│   └── RecentlyPlayedScreen.tsx  # Recently played tab
├── components/
│   ├── MusicPlayer.tsx        # Player UI with volume/mute
│   ├── LiveChat.tsx           # Chat interface
│   ├── MusicSearch.tsx        # Apple Music search + submit
│   └── RequestList.tsx        # User's request history
├── hooks/
│   ├── useRadioPlayer.ts      # Audio streaming logic
│   └── useMusicSearch.ts      # Apple Music API
├── convex/
│   ├── schema.ts              # Database schema
│   └── requests.ts            # Backend functions
├── lib/
│   ├── theme.ts               # Colors, spacing, typography
│   └── musickit.ts            # Apple Music API docs
├── dj-dashboard.html          # DJ web dashboard
├── SETUP.md                   # Detailed setup guide
├── DJ-DASHBOARD-SETUP.md      # Dashboard deployment guide
└── COMPLETE-SETUP-GUIDE.md    # This file
```

---

## What's Working Now (Out of the Box)

✅ Mobile app launches with 4 tabs  
✅ Dark theme with orange accents  
✅ Player UI (volume slider, mute button, album art display)  
✅ Request system (search, submit, view history)  
✅ Real-time Convex backend  
✅ DJ dashboard (view/manage requests)  
✅ Status tracking (Pending → Approved → Played)  

## What Needs Configuration

⏳ DJ Dashboard: Add Convex URL (1 minute)  
⏳ Apple Music: Get API token (30 minutes)  
⏳ Audio Streaming: Uncomment player code (5 minutes)  
⏳ Live Chat: Add backend (optional, future)  

---

## Environment Info

**Convex URL**: `https://resilient-warbler-266.convex.cloud`  
**Blast Radio Stream**: `https://www.blastradio.com/jacksonhammer`  
**Station Name**: Hammers Road House  
**Powered By**: Blast Radio  
**Platform**: Expo SDK 54.x.x + React Native + TypeScript  

---

## Next Steps (Priority Order)

### High Priority
1. ✅ **Set up DJ Dashboard** (5 min) → So DJ can manage requests
2. ⏳ **Enable audio streaming** (10 min) → So listeners can hear music
3. ⏳ **Get Apple Music token** (30 min) → So search works with real data

### Medium Priority
4. Deploy mobile app to TestFlight/Play Store internal testing
5. Add user authentication (so requests show real names)
6. Connect live chat to backend (Firebase, WebSocket, or Convex)
7. Add password protection to DJ dashboard

### Low Priority (Nice to Have)
8. Add DJ controls in mobile app (for host)
9. Show "Now Playing" in Recently Played tab
10. Add request limits (e.g., 3 requests per user per hour)
11. Add song voting/queue ordering

---

## Support & Docs

**Main Setup Guide**: `SETUP.md`  
**DJ Dashboard**: `DJ-DASHBOARD-SETUP.md`  
**Apple Music API**: `lib/musickit.ts`  
**Convex Functions**: `convex/requests.ts`  
**Theme Customization**: `lib/theme.ts`  

---

## Testing the Request System

1. **Open mobile app** → Tap "Request" tab
2. **Search for a song** (currently shows mock data)
3. **Tap [+]** on any song
4. **See success alert** → "Request Submitted! 🎵"
5. **Switch to "Your Requests"** tab
6. **See your request** with "Pending" status
7. **Open DJ dashboard** in browser
8. **See the same request** appear instantly
9. **Click "✓ Approve"** in dashboard
10. **Watch status change** to "Approved" (orange) in both app and dashboard

This confirms the entire request flow is working! 🎉

---

**Status**: ✅ Core System Complete  
**Backend**: ✅ Convex Synced  
**Mobile App**: ✅ Ready to Use  
**DJ Dashboard**: ⏳ Needs Convex URL  
**Audio Streaming**: ⏳ Needs Configuration  
