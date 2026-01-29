import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the currently playing song
 */
export const getCurrentSong = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("nowPlaying"),
      _creationTime: v.number(),
      songId: v.string(),
      title: v.string(),
      artist: v.string(),
      albumArt: v.string(),
      album: v.optional(v.string()),
      duration: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const songs = await ctx.db.query("nowPlaying").order("desc").take(1);
    return songs[0] || null;
  },
});

/**
 * Get recently played songs (last 10)
 */
export const getRecentlyPlayed = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("recentlyPlayed"),
      _creationTime: v.number(),
      songId: v.string(),
      title: v.string(),
      artist: v.string(),
      albumArt: v.string(),
      album: v.optional(v.string()),
      duration: v.number(),
      playedAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const songs = await ctx.db
      .query("recentlyPlayed")
      .withIndex("by_playedAt")
      .order("desc")
      .take(10);
    return songs;
  },
});

/**
 * Get the list of current active listeners with their usernames and avatar colors
 * Returns users who have been active in the last 2 minutes
 */
export const getActiveListeners = query({
  args: {},
  returns: v.array(
    v.object({
      username: v.string(),
      firstName: v.string(),
      avatarColor: v.optional(v.string()),
    })
  ),
  handler: async (ctx) => {
    const twoMinutesAgo = Date.now() - (2 * 60 * 1000);

    // Read newest sessions first, then stop once they're too old.
    const recentSessions = await ctx.db
      .query("activeListeners")
      .withIndex("by_lastSeen")
      .order("desc")
      .take(500);

    const activeSessions: Array<(typeof recentSessions)[number]> = [];
    for (const s of recentSessions) {
      if (s.lastSeen <= twoMinutesAgo) break;
      activeSessions.push(s);
    }

    const userIds = Array.from(
      new Set(
        activeSessions
          .map((s) => s.userId)
          .filter((id): id is Exclude<typeof id, undefined> => id !== undefined)
      )
    );

    const users = await Promise.all(
      userIds.map(async (userId) => {
        const user = await ctx.db.get(userId);
        return user
          ? {
              username: user.username,
              firstName: user.firstName,
              avatarColor: user.avatarColor,
            }
          : null;
      })
    );

    return users.filter(
      (u): u is { username: string; firstName: string; avatarColor?: string } => u !== null
    );
  },
});

/**
 * Get the number of current active listeners
 * Counts users who have been active in the last 2 minutes
 */
export const getActiveListenerCount = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const twoMinutesAgo = Date.now() - (2 * 60 * 1000);

    const recentSessions = await ctx.db
      .query("activeListeners")
      .withIndex("by_lastSeen")
      .order("desc")
      .take(1000);

    const uniqueUsers = new Set<string>();
    for (const s of recentSessions) {
      if (s.lastSeen <= twoMinutesAgo) break;
      uniqueUsers.add((s.userId ?? s.sessionId) as string);
    }

    return uniqueUsers.size;
  },
});

/**
 * Record that a user is actively listening
 * Call this periodically (every 30-45 seconds) while app is open
 */
export const recordListenerActivity = mutation({
  args: {
    sessionId: v.string(),
    userId: v.optional(v.id("users")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();

    const existing = await ctx.db
      .query("activeListeners")
      .withIndex("by_sessionId", (q: any) => q.eq("sessionId", args.sessionId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastSeen: now,
        userId: args.userId,
      });
    } else {
      await ctx.db.insert("activeListeners", {
        sessionId: args.sessionId,
        userId: args.userId,
        lastSeen: now,
      });
    }

    // Clean up old sessions (older than 5 minutes) without relying on lt/gt range helpers.
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    for await (const session of ctx.db
      .query("activeListeners")
      .withIndex("by_lastSeen")
      .order("asc")) {
      if (session.lastSeen >= fiveMinutesAgo) break;
      await ctx.db.delete(session._id);
    }

    return null;
  },
});

/**
 * Update the now playing song
 * This should be called by an admin/DJ when changing songs
 */
export const updateNowPlaying = mutation({
  args: {
    songId: v.string(),
    title: v.string(),
    artist: v.string(),
    albumArt: v.string(),
    album: v.optional(v.string()),
    duration: v.number(),
  },
  returns: v.id("nowPlaying"),
  handler: async (ctx, args) => {
    // Clear existing now playing entries
    const existing = await ctx.db.query("nowPlaying").collect();
    for (const song of existing) {
      await ctx.db.delete(song._id);
    }

    // Add to recently played
    await ctx.db.insert("recentlyPlayed", {
      songId: args.songId,
      title: args.title,
      artist: args.artist,
      albumArt: args.albumArt,
      album: args.album,
      duration: args.duration,
      playedAt: Date.now(),
    });

    // Set new now playing
    return await ctx.db.insert("nowPlaying", {
      songId: args.songId,
      title: args.title,
      artist: args.artist,
      albumArt: args.albumArt,
      album: args.album,
      duration: args.duration,
    });
  },
});

/**
 * Internal mutation used by Apple Music action
 */
export const updateNowPlayingMutation = internalMutation({
  args: {
    songId: v.string(),
    title: v.string(),
    artist: v.string(),
    albumArt: v.string(),
    album: v.optional(v.string()),
    duration: v.number(),
  },
  returns: v.id("nowPlaying"),
  handler: async (ctx, args) => {
    // Clear existing now playing entries
    const existing = await ctx.db.query("nowPlaying").collect();
    for (const song of existing) {
      await ctx.db.delete(song._id);
    }

    // Add to recently played
    await ctx.db.insert("recentlyPlayed", {
      songId: args.songId,
      title: args.title,
      artist: args.artist,
      albumArt: args.albumArt,
      album: args.album,
      duration: args.duration,
      playedAt: Date.now(),
    });

    // Set new now playing
    return await ctx.db.insert("nowPlaying", {
      songId: args.songId,
      title: args.title,
      artist: args.artist,
      albumArt: args.albumArt,
      album: args.album,
      duration: args.duration,
    });
  },
});

/**
 * Update now playing by searching Apple Music
 * This combines Apple Music search with updating the database
 */
export const updateNowPlayingBySearch = mutation({
  args: {
    title: v.string(),
    artist: v.optional(v.string()),
  },
  returns: v.union(v.id("nowPlaying"), v.null()),
  handler: async (ctx, args) => {
    // Note: This is a simplified version. In production, you'd want to:
    // 1. Call the Apple Music search action from here
    // 2. Then update the database with the results
    // For now, this will be a placeholder that the admin can use
    
    // Clear existing now playing entries
    const existing = await ctx.db.query("nowPlaying").collect();
    for (const song of existing) {
      await ctx.db.delete(song._id);
    }

    // You would get the song data from Apple Music here
    // For now, return null to indicate it needs manual update
    return null;
  },
});

/**
 * Clear all requests (admin function)
 */
export const clearAllRequests = mutation({
  args: {},
  returns: v.object({ count: v.number() }),
  handler: async (ctx) => {
    const requests = await ctx.db.query("requests").collect();
    
    for (const request of requests) {
      await ctx.db.delete(request._id);
    }
    
    return { count: requests.length };
  },
});

/**
 * Clear now playing (admin function)
 */
export const clearNowPlaying = mutation({
  args: {},
  returns: v.object({ count: v.number() }),
  handler: async (ctx) => {
    const nowPlaying = await ctx.db.query("nowPlaying").collect();
    
    for (const item of nowPlaying) {
      await ctx.db.delete(item._id);
    }
    
    return { count: nowPlaying.length };
  },
});

/**
 * Clear recently played history (admin function)
 */
export const clearRecentlyPlayed = mutation({
  args: {},
  returns: v.object({ count: v.number() }),
  handler: async (ctx) => {
    const recentlyPlayed = await ctx.db.query("recentlyPlayed").collect();
    
    for (const item of recentlyPlayed) {
      await ctx.db.delete(item._id);
    }
    
    return { count: recentlyPlayed.length };
  },
});

/**
 * Clear active listeners (admin function - force refresh)
 */
export const clearActiveListeners = mutation({
  args: {},
  returns: v.object({ count: v.number() }),
  handler: async (ctx) => {
    const listeners = await ctx.db.query("activeListeners").collect();
    
    for (const listener of listeners) {
      await ctx.db.delete(listener._id);
    }
    
    return { count: listeners.length };
  },
});