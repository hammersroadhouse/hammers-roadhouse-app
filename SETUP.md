# Hammers Road House Radio - Setup Guide

## Architecture Overview

**Audio Streaming:** Blast Radio  
**Metadata Display:** Apple Music API  
**Stream URL:** https://www.blastradio.com/jacksonhammer

### How It Works
1. **Audio plays** from Blast Radio's live stream (continuous, no play/pause)
2. **Song metadata** (title, artist, album art) comes from Apple Music API
3. **Player displays** Apple Music metadata while streaming Blast Radio audio
4. **Updates every 30 seconds** to show current track info

---

## Setup Steps

### 1. Install Audio Package
The app needs `expo-av` for audio streaming:

**Installation required:** Run `npx expo install expo-av` in your project

Once installed, uncomment the `Audio.*` code in `hooks/useRadioPlayer.ts`

### 2. Get Apple Music Developer Token

#### A. Apple Developer Account
- Go to https://developer.apple.com
- Sign in with your Apple ID
- Enroll in Apple Developer Program ($99/year)

#### B. Create MusicKit Identifier
1. Go to https://developer.apple.com/account/resources/identifiers/list
2. Click the (+) button
3. Select "MusicKit Identifier"
4. Enter description: "Hammers Road House Radio"
5. Click Register

#### C. Create MusicKit Key
1. Go to https://developer.apple.com/account/resources/authkeys/list
2. Click (+) to create new key
3. Name: "Hammers Road House MusicKit Key"
4. Enable MusicKit checkbox
5. Select your MusicKit identifier
6. Click Continue, then Register
7. **Download the .p8 file** (you can't download it again!)
8. Note your **Key ID** (10 characters)
9. Note your **Team ID** (top right corner)

#### D. Generate JWT Token
You need to create a JWT (JSON Web Token) from your private key.

**Option 1: Online Generator**
- Use: https://github.com/pelauimagineering/apple-music-token-generator
- Upload your .p8 key file
- Enter Key ID and Team ID
- Generate token (valid for 180 days)

**Option 2: Node.js Script**
```javascript
const jwt = require('jsonwebtoken');
const fs = require('fs');

const privateKey = fs.readFileSync('AuthKey_XXXXXXXXXX.p8').toString();
const token = jwt.sign({}, privateKey, {
algorithm: 'ES256',
expiresIn: '180d',
issuer: 'YOUR_TEAM_ID',
header: {
alg: 'ES256',
kid: 'YOUR_KEY_ID'
}
});

console.log(token);
```

#### E. Add Token to App
1. Open `hooks/useRadioPlayer.ts`
2. Find `const APPLE_MUSIC_TOKEN = '';`
3. Paste your JWT token between the quotes
4. Save the file

### 3. Track Current Song

You need a way to know what song is currently playing on Blast Radio.

#### Option A: Blast Radio API
- Contact Blast Radio support
- Ask if they provide a metadata API endpoint
- If yes, update `fetchCurrentSongMetadata()` to call their endpoint

#### Option B: Your Own Backend
- Create a backend service (Node.js, Python, etc.)
- Store current track in database when you queue it
- Expose API: `GET /api/current-track`
- App polls this every 30 seconds
- Update `fetchCurrentSongMetadata()` to call your endpoint

#### Option C: Manual Updates (Simple)
- Use Convex (already integrated in your app)
- Create a "currentTrack" table
- Build admin panel to update current track
- App queries Convex for current track
- Good for getting started quickly

#### Option D: Stream Metadata (Advanced)
- Some radio streams include metadata (Icecast format)
- Would need to parse metadata from the stream
- Check with Blast Radio if their stream includes this

### 4. Enable Audio Playback
Once expo-av is installed:

1. Open `hooks/useRadioPlayer.ts`
2. Uncomment the import: `import { Audio } from 'expo-av';`
3. Uncomment the `Audio.setAudioModeAsync()` code
4. Uncomment the `Audio.Sound.createAsync()` code
5. Uncomment the `audioRef.current.setVolumeAsync()` calls

The stream will start playing automatically!

---

## Testing

### Test Audio Stream
1. Run the app on a real device (audio may not work in simulator)
2. Go to the Live tab
3. Audio should start playing from Blast Radio
4. Test volume slider - should adjust audio
5. Test mute button - should silence audio

### Test Metadata Display
1. Ensure APPLE_MUSIC_TOKEN is set
2. Ensure you have a way to get current track name
3. Song title, artist, and album art should update
4. Check console for any API errors

### Test Live Chat
1. Go to Chat tab
2. Type a message
3. Hit send
4. Message should appear in chat
5. (For real chat, you'll need to add backend - see NEXT_STEPS.md)

---

## Troubleshooting

### No Audio Playing
- Check that expo-av is installed
- Check that Audio code is uncommented
- Check stream URL is correct
- Try on real device (not simulator)
- Check device volume is up

### No Metadata Showing
- Check APPLE_MUSIC_TOKEN is set and valid
- Check token hasn't expired (180 days max)
- Check you're getting current track name somewhere
- Check Apple Music API response in console
- Verify you have internet connection

### Volume Control Not Working
- Check expo-av is installed
- Check Audio.setVolumeAsync calls are uncommented
- Check audioRef.current is not null

---

## File Structure

```
hooks/useRadioPlayer.ts    - Main audio player logic
lib/musickit.ts             - Apple Music API docs
components/MusicPlayer.tsx  - Player UI component
components/LiveChat.tsx     - Chat interface
screens/PlayerScreen.tsx    - Live tab screen
```

---

## Next Steps

Once basic streaming works:
- Add backend for live chat (WebSocket/Firebase)
- Store recently played in Convex database
- Add push notifications for favorite songs
- Add share functionality
- Add favorites/bookmarks
- Analytics for popular tracks

---

## Support

**Apple MusicKit Docs:** https://developer.apple.com/musickit/  
**expo-av Docs:** https://docs.expo.dev/versions/latest/sdk/audio/  
**Blast Radio Support:** Contact your Blast Radio account manager

---

**Built for Hammers Road House** 🎸
Powered by Blast Radio
