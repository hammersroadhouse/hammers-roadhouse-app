import { useEffect, useState, useCallback, useRef } from 'react';
import { useQuery, useAction, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAuthState } from './authStore';

// Blast Radio stream URL for Hammers Road House
const BLAST_RADIO_STREAM_URL = 'https://www.blastradio.com/jacksonhammer';

export interface Song {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  duration: number;
  streamUrl: string;
  album?: string;
}

export interface PlayerState {
  isPlaying: boolean;
  currentSong: Song | null;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
}

export const useRadioPlayer = () => {
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: true,
    currentSong: null,
    progress: 0,
    duration: 0,
    volume: 0.8,
    isMuted: false,
  });

  // Get current user from auth
  const { user } = useAuthState();

  // Generate a unique session ID for this user
  const [sessionId] = useState(() => {
    const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return id;
  });

  const audioRef = useRef<any>(null);

  // Fetch current song from Convex
  const nowPlayingData = useQuery(api.radio.getCurrentSong, {});
  
  // Fetch recently played from Convex
  const recentlyPlayedData = useQuery(api.radio.getRecentlyPlayed, {});

  // Fetch active listener count
  const activeListenerCount = useQuery(api.radio.getActiveListenerCount, {});

  // Fetch active listeners with avatar data
  const activeListenersData = useQuery(api.radio.getActiveListeners, {});

  // Action to sync Last.fm data
  const syncLastFm = useAction(api.lastfm.syncNowPlaying);

  // Mutation to record listener activity
  const recordActivity = useMutation(api.radio.recordListenerActivity);

  // Poll Last.fm every 15 seconds to update now playing
  useEffect(() => {
    const pollLastFm = async () => {
      try {
        await syncLastFm();
      } catch (error) {
        console.error('Error syncing Last.fm:', error);
      }
    };

    // Sync immediately on mount
    pollLastFm();

    // Then poll every 15 seconds
    const interval = setInterval(pollLastFm, 15000);

    return () => clearInterval(interval);
  }, [syncLastFm]);

  // Record listener activity every 30 seconds
  useEffect(() => {
    const recordUserActivity = async () => {
      try {
        await recordActivity({ 
          sessionId,
          userId: user?.userId,
        });
      } catch (error) {
        console.error('Error recording activity:', error);
      }
    };

    // Record immediately
    recordUserActivity();

    // Then record every 30 seconds
    const interval = setInterval(recordUserActivity, 30000);

    return () => clearInterval(interval);
  }, [recordActivity, sessionId, user?.userId]);

  // Update player state when now playing changes
  useEffect(() => {
    if (nowPlayingData) {
      setPlayerState((prev: PlayerState) => ({
        ...prev,
        currentSong: {
          id: nowPlayingData.songId,
          title: nowPlayingData.title,
          artist: nowPlayingData.artist,
          albumArt: nowPlayingData.albumArt,
          album: nowPlayingData.album,
          duration: nowPlayingData.duration,
          streamUrl: BLAST_RADIO_STREAM_URL,
        },
      }));
    } else {
      // Fallback if no song is set
      setPlayerState((prev: PlayerState) => ({
        ...prev,
        currentSong: {
          id: '1',
          title: 'Welcome to Hammers Road House',
          artist: '',
          albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
          duration: 0,
          streamUrl: BLAST_RADIO_STREAM_URL,
        },
      }));
    }
  }, [nowPlayingData]);

  // Convert recently played data to Song format
  const recentlyPlayed: Song[] = (recentlyPlayedData || []).map((song: any) => ({
    id: song.songId,
    title: song.title,
    artist: song.artist,
    albumArt: song.albumArt,
    album: song.album,
    duration: song.duration,
    streamUrl: BLAST_RADIO_STREAM_URL,
  }));

  // Initialize audio player with Blast Radio stream
  useEffect(() => {
    const initializePlayer = async () => {
      try {
        // Uncomment when expo-av is installed:
        /*
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri: BLAST_RADIO_STREAM_URL },
          { shouldPlay: true, volume: playerState.volume },
          onPlaybackStatusUpdate
        );

        audioRef.current = sound;
        await sound.playAsync();
        */
      } catch (error) {
        console.error('Error initializing audio player:', error);
      }
    };

    initializePlayer();

    // Cleanup on unmount
    return () => {
      const sound = audioRef.current;
      if (sound) {
        sound.unloadAsync?.();
      }
    };
  }, []);

  // Handle audio playback status updates
  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPlayerState((prev: PlayerState) => ({
        ...prev,
        isPlaying: status.isPlaying,
        progress: status.positionMillis / 1000,
        duration: status.durationMillis ? status.durationMillis / 1000 : 0,
      }));
    }
  };

  const setVolume = useCallback(async (volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setPlayerState((prev: PlayerState) => ({
      ...prev,
      volume: clampedVolume,
      isMuted: clampedVolume === 0 ? true : prev.isMuted,
    }));

    // Apply volume to audio player
    if (audioRef.current) {
      try {
        // Uncomment when expo-av is installed:
        // await audioRef.current.setVolumeAsync(clampedVolume);
      } catch (error) {
        console.error('Error setting volume:', error);
      }
    }
  }, []);

  const toggleMute = useCallback(async () => {
    setPlayerState((prev: PlayerState) => {
      const newMuted = !prev.isMuted;
      const newVolume = newMuted ? 0 : (prev.volume === 0 ? 0.8 : prev.volume);

      // Apply to audio player
      if (audioRef.current) {
        try {
          // Uncomment when expo-av is installed:
          // audioRef.current.setVolumeAsync(newMuted ? 0 : prev.volume);
        } catch (error) {
          console.error('Error toggling mute:', error);
        }
      }

      return { ...prev, isMuted: newMuted, volume: prev.volume === 0 && !newMuted ? 0.8 : prev.volume };
    });
  }, []);

  const getCurrentVolume = () => {
    return playerState.isMuted ? 0 : playerState.volume;
  };

  return {
    playerState,
    recentlyPlayed,
    setVolume,
    toggleMute,
    getCurrentVolume,
    activeListenerCount: activeListenerCount ?? 0,
    activeListeners: (activeListenersData ?? []).map((listener: any) => ({
      ...listener,
      avatarColor: listener.avatarColor || '#FF5722',
    })),
  };
};

// INTEGRATION STEPS:
// 
// 1. INSTALL EXPO-AV:
//    Run: npx expo install expo-av
//    (This enables audio streaming functionality)
//
// 2. GET APPLE MUSIC DEVELOPER TOKEN:
//    - Go to https://developer.apple.com/musickit/
//    - Create a MusicKit identifier and key
//    - Generate a developer token (JWT)
//    - Add it to APPLE_MUSIC_TOKEN constant above
//
// 3. METADATA SOURCE:
//    - You'll need a way to know what song is currently playing on Blast Radio
//    - Options:
//      a) Blast Radio API endpoint that returns current track
//      b) Your own backend that tracks playlist
//      c) Manual updates via admin panel
//    - Once you have the track name, use Apple Music API to fetch metadata
//
// 4. UNCOMMENT THE CODE:
//    - Once expo-av is installed, uncomment the Audio.* calls above
//    - The stream will play from Blast Radio URL
//    - Metadata will display from Apple Music
//
// ARCHITECTURE:
// - Audio Stream: Blast Radio (https://www.blastradio.com/jacksonhammer)
// - Metadata: Apple Music API (song title, artist, album art)
// - Volume Control: expo-av handles this
// - Live Stream: No play/pause needed, always plays