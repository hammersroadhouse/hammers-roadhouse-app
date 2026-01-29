"use node";

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import crypto from "crypto";
import { internal } from "./_generated/api";

// Apple Music API configuration
const APPLE_MUSIC_API_BASE = "https://api.music.apple.com/v1";

// Your Apple Music credentials
// Get these from: https://developer.apple.com/account/resources/authkeys/list
// 1. Create a MusicKit Key in your Apple Developer account
// 2. Download the .p8 file (this is your PRIVATE_KEY)
// 3. Note the Key ID and Team ID

const TEAM_ID = "D7K329J439";
const KEY_ID = "ZG8Y3VAWRY";
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgmwf7WkhpmXu6mFQx
DrUqrwU3NQxYkoPP1n50Wvy+HNGgCgYIKoZIzj0DAQehRANCAASPdFHNohhZJ9Ej
Xx5IgQ2lMCjma3zFJuafDJS/34DE4w+2eiIcD9HFnKzdS1gs2Sylm723FIwmNTf5
LrEoPRDb
-----END PRIVATE KEY-----`;

/**
 * Generate a JWT token for Apple Music API
 */
async function generateAppleMusicToken(): Promise<string> {
  if (!TEAM_ID || !KEY_ID || !PRIVATE_KEY) {
    throw new Error("Apple Music credentials not configured. Please add TEAM_ID, KEY_ID, and PRIVATE_KEY to convex/appleMusic.ts");
  }
  
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + (6 * 60 * 60); // 6 hours from now

  const header = {
    alg: "ES256",
    kid: KEY_ID,
  };

  const payload = {
    iss: TEAM_ID,
    iat: now,
    exp: expiresAt,
  };

  const base64UrlEncode = (str: string) => {
    return Buffer.from(str)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  // Use ECDSA (ES256) signing for Apple Music
  const signatureBuffer = crypto.sign(
    "sha256",
    Buffer.from(signingInput),
    {
      key: PRIVATE_KEY,
      format: "pem",
    }
  );

  const signature = signatureBuffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return `${signingInput}.${signature}`;
}

/**
 * Search Apple Music catalog for a song by title and artist
 */
export const searchSong = action({
  args: {
    title: v.string(),
    artist: v.optional(v.string()),
  },
  returns: v.union(
    v.object({
      id: v.string(),
      title: v.string(),
      artist: v.string(),
      albumArt: v.string(),
      album: v.optional(v.string()),
      duration: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    try {
      const token = await generateAppleMusicToken();
      const searchQuery = args.artist 
        ? `${args.title} ${args.artist}` 
        : args.title;

      const response = await fetch(
        `${APPLE_MUSIC_API_BASE}/catalog/us/search?term=${encodeURIComponent(searchQuery)}&types=songs&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Apple Music API error:", await response.text());
        return null;
      }

      const data = await response.json();
      
      if (!data.results?.songs?.data?.[0]) {
        return null;
      }

      const song = data.results.songs.data[0];
      const attributes = song.attributes;

      return {
        id: song.id,
        title: attributes.name,
        artist: attributes.artistName,
        albumArt: attributes.artwork.url
          .replace("{w}", "400")
          .replace("{h}", "400"),
        album: attributes.albumName,
        duration: Math.floor(attributes.durationInMillis / 1000),
      };
    } catch (error) {
      console.error("Error searching Apple Music:", error);
      return null;
    }
  },
});

/**
 * Search Apple Music and update now playing
 * This combines the search with updating the database
 */
export const searchAndUpdateNowPlaying = action({
  args: {
    title: v.string(),
    artist: v.optional(v.string()),
  },
  returns: v.union(
    v.object({
      success: v.boolean(),
      message: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    try {
      // Search Apple Music for the song
      const song = await ctx.runAction(internal.appleMusic.searchSong, {
        title: args.title,
        artist: args.artist,
      });

      if (!song) {
        return {
          success: false,
          message: `Song not found: ${args.title}${args.artist ? ' by ' + args.artist : ''}`,
        };
      }

      // Update the now playing in the database
      await ctx.runMutation(internal.appleMusic.updateNowPlayingInternal, {
        songId: song.id,
        title: song.title,
        artist: song.artist,
        albumArt: song.albumArt,
        album: song.album,
        duration: song.duration,
      });

      return {
        success: true,
        message: `Now playing: ${song.title} by ${song.artist}`,
      };
    } catch (error) {
      console.error("Error updating now playing:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },
});

/**
 * Internal mutation to update now playing
 * Called by the action after fetching song data from Apple Music
 */
export const updateNowPlayingInternal = internalAction({
  args: {
    songId: v.string(),
    title: v.string(),
    artist: v.string(),
    albumArt: v.string(),
    album: v.optional(v.string()),
    duration: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.radio.updateNowPlayingMutation, args);
    return null;
  },
});

/**
 * Get multiple songs metadata by their IDs
 */
export const getSongsByIds = action({
  args: {
    songIds: v.array(v.string()),
  },
  returns: v.array(
    v.object({
      id: v.string(),
      title: v.string(),
      artist: v.string(),
      albumArt: v.string(),
      album: v.optional(v.string()),
      duration: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    try {
      const token = await generateAppleMusicToken();
      const ids = args.songIds.join(",");

      const response = await fetch(
        `${APPLE_MUSIC_API_BASE}/catalog/us/songs?ids=${ids}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Apple Music API error:", await response.text());
        return [];
      }

      const data = await response.json();
      
      if (!data.data) {
        return [];
      }

      return data.data.map((song: any) => {
        const attributes = song.attributes;
        return {
          id: song.id,
          title: attributes.name,
          artist: attributes.artistName,
          albumArt: attributes.artwork.url
            .replace("{w}", "400")
            .replace("{h}", "400"),
          album: attributes.albumName,
          duration: Math.floor(attributes.durationInMillis / 1000),
        };
      });
    } catch (error) {
      console.error("Error fetching songs from Apple Music:", error);
      return [];
    }
  },
});

/**
 * Debug function to test Apple Music API connection
 */
export const testAppleMusicConnection = action({
  args: {},
  returns: v.object({
    tokenGenerated: v.boolean(),
    apiResponse: v.string(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    try {
      const token = await generateAppleMusicToken();
      
      const response = await fetch(
        `${APPLE_MUSIC_API_BASE}/catalog/us/search?term=hello&types=songs&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseText = await response.text();
      
      return {
        tokenGenerated: true,
        apiResponse: `Status: ${response.status} - ${responseText.substring(0, 500)}`,
      };
    } catch (error) {
      return {
        tokenGenerated: false,
        apiResponse: "",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});