"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Last.fm API configuration
const LASTFM_API_BASE = "http://ws.audioscrobbler.com/2.0/";
const LASTFM_USERNAME = "jacksonhammer";

// Last.fm API Key - Get your own free key at: https://www.last.fm/api/account/create
// This is a placeholder - you should get your own API key
const LASTFM_API_KEY = ""; // Add your Last.fm API key here

/**
 * Fetch the currently playing track from Last.fm
 */
export const fetchNowPlaying = action({
  args: {},
  returns: v.union(
    v.object({
      success: v.boolean(),
      track: v.optional(v.object({
        title: v.string(),
        artist: v.string(),
        album: v.optional(v.string()),
        albumArt: v.optional(v.string()),
        isPlaying: v.boolean(),
      })),
      message: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    if (!LASTFM_API_KEY) {
      return {
        success: false,
        message: "Last.fm API key not configured. Get one at https://www.last.fm/api/account/create",
      };
    }

    try {
      const url = `${LASTFM_API_BASE}?method=user.getrecenttracks&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}&format=json&limit=1`;
      
      const response = await fetch(url);

      if (!response.ok) {
        console.error("Last.fm API error:", response.status, await response.text());
        return {
          success: false,
          message: `Last.fm API error: ${response.status}`,
        };
      }

      const data = await response.json();
      
      if (!data.recenttracks?.track?.[0]) {
        return {
          success: false,
          message: "No tracks found",
        };
      }

      const track = data.recenttracks.track[0];
      const isPlaying = track["@attr"]?.nowplaying === "true";

      // Get the largest album art available
      const images = track.image || [];
      const albumArt = images[images.length - 1]?.["#text"] || images.find((img: any) => img.size === "extralarge")?.[("#text" as any)] || undefined;

      const trackData = {
        title: track.name,
        artist: track.artist["#text"] || track.artist,
        album: track.album?.["#text"],
        albumArt,
        isPlaying,
      };

      // Update the database with the current track
      if (isPlaying) {
        await ctx.runMutation(internal.radio.updateNowPlayingMutation, {
          songId: `lastfm-${track.mbid || Date.now()}`,
          title: trackData.title,
          artist: trackData.artist,
          albumArt: trackData.albumArt || "https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png",
          album: trackData.album,
          duration: parseInt(track.duration) || 180,
        });
      }

      return {
        success: true,
        track: trackData,
      };
    } catch (error) {
      console.error("Error fetching from Last.fm:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

/**
 * Sync Last.fm now playing to the database
 * This can be called periodically to keep the app updated
 */
export const syncNowPlaying = action({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx) => {
    const result = await ctx.runAction(internal.lastfm.fetchNowPlaying);
    
    if (!result) {
      return {
        success: false,
        message: "Failed to fetch from Last.fm",
      };
    }

    if (!result.success) {
      return {
        success: false,
        message: result.message || "Unknown error",
      };
    }

    if (result.track?.isPlaying) {
      return {
        success: true,
        message: `Now playing: ${result.track.title} by ${result.track.artist}`,
      };
    } else {
      return {
        success: false,
        message: "No track currently playing",
      };
    }
  },
});