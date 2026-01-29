/**
 * HAMMERS ROAD HOUSE - MUSIC STREAMING ARCHITECTURE
 * 
 * Audio Stream: Blast Radio
 * Metadata: Apple Music API
 * 
 * HOW IT WORKS:
 * 1. Audio streams from Blast Radio URL: https://www.blastradio.com/jacksonhammer
 * 2. Song metadata (title, artist, album art) fetched from Apple Music API
 * 3. Player displays Apple Music metadata while playing Blast Radio audio
 */

// BLAST RADIO INTEGRATION
// Stream URL: https://www.blastradio.com/jacksonhammer
// - Provides continuous audio stream
// - No play/pause controls needed (always live)
// - Volume and mute controls handled by expo-av

// APPLE MUSIC API INTEGRATION
// Used only for fetching metadata (not for audio streaming)
export const MUSICKIT_SETUP = {
  // 1. Create Apple Developer Account (if you don't have one)
  appleDevAccount: 'https://developer.apple.com',

  // 2. Create a MusicKit Identifier
  createIdentifier: 'https://developer.apple.com/account/resources/identifiers/list',
  steps: [
    'Sign in to Apple Developer',
    'Go to Certificates, Identifiers & Profiles',
    'Click Identifiers → (+) button',
    'Select "MusicKit Identifier"',
    'Enter description: "Hammers Road House Radio"',
    'Register the identifier',
  ],

  // 3. Create a MusicKit Private Key
  createKey: 'https://developer.apple.com/account/resources/authkeys/list',
  keySteps: [
    'Go to Keys section',
    'Click (+) to create new key',
    'Name it "Hammers Road House MusicKit Key"',
    'Enable MusicKit',
    'Select your MusicKit identifier',
    'Download the .p8 key file (SAVE THIS - you can\'t download again)',
    'Note your Key ID (10-character string)',
    'Note your Team ID (in top right of Developer portal)',
  ],

  // 4. Generate Developer Token (JWT)
  generateToken: 'You need to create a JWT (JSON Web Token) from your private key',
  tokenInfo: {
    algorithm: 'ES256',
    keyId: 'Your 10-character Key ID',
    teamId: 'Your Team ID',
    expiresIn: '180 days (max)',
  },

  // Token generation options:
  options: [
    'Use online tool: https://github.com/pelauimagineering/apple-music-token-generator',
    'Use Node.js script with jsonwebtoken library',
    'Use backend service to generate tokens dynamically',
  ],
};

// METADATA FETCHING EXAMPLE
export const APPLE_MUSIC_API = {
  baseUrl: 'https://api.music.apple.com/v1',
  
  // Search for a song by title and artist
  searchSong: async (title: string, artist: string, token: string) => {
    const query = encodeURIComponent(`${title} ${artist}`);
    const url = `https://api.music.apple.com/v1/catalog/us/search?term=${query}&types=songs&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    const song = data.results?.songs?.data?.[0];
    
    if (song) {
      return {
        title: song.attributes.name,
        artist: song.attributes.artistName,
        albumArt: song.attributes.artwork.url
          .replace('{w}', '400')
          .replace('{h}', '400'),
        albumName: song.attributes.albumName,
        duration: song.attributes.durationInMillis / 1000,
      };
    }
    
    return null;
  },
};

// GETTING CURRENT TRACK INFO FROM BLAST RADIO
export const BLAST_RADIO_INTEGRATION = {
  // You need a way to know what song is currently playing
  // Options:
  
  // Option 1: Blast Radio API (if they provide one)
  // Contact Blast Radio support to ask if they have an API endpoint
  // that returns current track metadata
  
  // Option 2: Your own backend
  // - Create a backend service that tracks your playlist
  // - Store current track in database
  // - App polls this endpoint every 30 seconds
  // - Example: GET https://your-backend.com/api/current-track
  
  // Option 3: Manual updates
  // - Create admin panel to manually update current track
  // - Store in Convex database
  // - App queries Convex for current track
  
  // Option 4: Metadata from stream (advanced)
  // - Some radio streams include metadata in the stream (Icecast)
  // - Would need to parse this from the stream
  // - Check with Blast Radio if their stream includes metadata
};

// COMPLETE WORKFLOW:
// 1. Get current track name from Blast Radio (via API/backend/manual)
// 2. Search Apple Music API for that track
// 3. Get album art, artist, etc. from Apple Music
// 4. Display this metadata in the player
// 5. Audio continues playing from Blast Radio stream
// 6. Poll for updates every 30 seconds to refresh metadata

export const REQUIRED_PACKAGES = {
  audio: 'expo-av',
  install: 'npx expo install expo-av',
  docs: 'https://docs.expo.dev/versions/latest/sdk/audio/',
};

// IMPLEMENTATION CHECKLIST:
// [ ] Install expo-av package
// [ ] Get Apple Developer account
// [ ] Create MusicKit identifier
// [ ] Generate MusicKit private key
// [ ] Create JWT token from private key
// [ ] Add token to useRadioPlayer.ts (APPLE_MUSIC_TOKEN)
// [ ] Set up backend/API to track current playing song
// [ ] Uncomment Audio code in useRadioPlayer.ts
// [ ] Test streaming from Blast Radio URL
// [ ] Test metadata fetching from Apple Music
// [ ] Verify volume and mute controls work
// [ ] Add error handling for network issues
// [ ] Test on iOS device (MusicKit may have device restrictions)