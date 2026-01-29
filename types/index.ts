export interface Song {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  duration: number;
  streamUrl: string;
}

export interface PlayerState {
  isPlaying: boolean;
  currentSong: Song | null;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
}

export interface ChatMessage {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
  isOwn?: boolean;
}

export interface SongRequest {
  id: string;
  songId: string;
  title: string;
  artist: string;
  albumArt: string;
  album?: string;
  duration: number;
  requestedBy: string;
  timestamp: Date;
  status: 'pending' | 'approved' | 'played';
}

export interface AppleMusicSong {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  album: string;
  duration: number;
}