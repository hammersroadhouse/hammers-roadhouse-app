import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    firstName: v.string(),
    username: v.string(),
    email: v.string(),
    emailVerified: v.boolean(),
    verificationCode: v.optional(v.string()),
    verificationExpiry: v.optional(v.number()),
    avatarColor: v.optional(v.string()), // Color hex code for avatar badge
    pushToken: v.optional(v.string()), // Expo push notification token
  })
    .index("by_email", ["email"])
    .index("by_username", ["username"]),

  // Listener requests (direct messages to DJ)
  djMessages: defineTable({
    text: v.string(),
    userId: v.id("users"),
    username: v.string(),
    read: v.boolean(),
  }).index("by_userId", ["userId"]),

  // Current song playing on the radio
  nowPlaying: defineTable({
    songId: v.string(),
    title: v.string(),
    artist: v.string(),
    albumArt: v.string(),
    album: v.optional(v.string()),
    duration: v.number(),
  }),

  // History of songs that have been played
  recentlyPlayed: defineTable({
    songId: v.string(),
    title: v.string(),
    artist: v.string(),
    albumArt: v.string(),
    album: v.optional(v.string()),
    duration: v.number(),
    playedAt: v.number(),
  }).index("by_playedAt", ["playedAt"]),

  // Track active listeners in the app
  activeListeners: defineTable({
    sessionId: v.string(),
    userId: v.optional(v.id("users")),
    lastSeen: v.number(),
  })
    .index("by_lastSeen", ["lastSeen"])
    .index("by_userId", ["userId"])
    .index("by_sessionId", ["sessionId"]),
});