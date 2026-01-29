import { useRef, useState } from 'react';
import type { AppleMusicSong } from '../types';

export function useMusicSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<AppleMusicSong[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Used to ignore stale network responses (race conditions).
  // Any time we start a new search OR clear the search, this id increments.
  const searchRequestIdRef = useRef(0);

  const clearSearch = () => {
    searchRequestIdRef.current += 1;
    setSearchQuery('');
    setResults([]);
    setIsLoading(false);
    setError(null);
  };

  const searchAppleMusic = async (query: string) => {
    setSearchQuery(query);

    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      clearSearch();
      return;
    }

    const requestId = (searchRequestIdRef.current += 1);

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with real Apple Music API call.
      // Keeping this mock so the UI stays functional without tokens.
      await new Promise((resolve) => setTimeout(resolve, 500));

      // If something newer happened, ignore this response.
      if (requestId !== searchRequestIdRef.current) {
        return;
      }

      const mockResults: AppleMusicSong[] = [
        {
          id: `${normalizedQuery}-1`,
          title: `${normalizedQuery} Song 1`,
          artist: 'Artist Name',
          albumArt: 'https://via.placeholder.com/200',
          album: 'Album Name',
          duration: 240,
        },
        {
          id: `${normalizedQuery}-2`,
          title: `${normalizedQuery} Song 2`,
          artist: 'Another Artist',
          albumArt: 'https://via.placeholder.com/200',
          album: 'Another Album',
          duration: 180,
        },
        {
          id: `${normalizedQuery}-3`,
          title: `Best of ${normalizedQuery}`,
          artist: 'Various Artists',
          albumArt: 'https://via.placeholder.com/200',
          album: 'Compilation',
          duration: 300,
        },
      ];

      setResults(mockResults);

      /* PRODUCTION CODE - Uncomment when Apple Music API is configured:

      const developerToken = 'YOUR_APPLE_MUSIC_DEVELOPER_TOKEN';

      const response = await fetch(
        `https://api.music.apple.com/v1/catalog/us/search?term=${encodeURIComponent(normalizedQuery)}&types=songs&limit=25`,
        {
          headers: {
            Authorization: `Bearer ${developerToken}`,
          },
        }
      );

      const data = await response.json();

      const songs: AppleMusicSong[] = data.results.songs.data.map((song: any) => ({
        id: song.id,
        title: song.attributes.name,
        artist: song.attributes.artistName,
        albumArt: song.attributes.artwork.url.replace('{w}x{h}', '400x400'),
        album: song.attributes.albumName,
        duration: Math.floor(song.attributes.durationInMillis / 1000),
      }));

      setResults(songs);
      */
    } catch (err) {
      console.error('Search error:', err);

      if (requestId === searchRequestIdRef.current) {
        setError('Failed to search Apple Music. Please try again.');
      }
    } finally {
      // Only end loading if we are still the latest request.
      if (requestId === searchRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    results,
    isLoading,
    error,
    searchAppleMusic,
    clearSearch,
  };
}