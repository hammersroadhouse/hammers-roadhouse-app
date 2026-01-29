import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Submit a song request
export const submitRequest = mutation({
  args: {
    songId: v.string(),
    title: v.string(),
    artist: v.string(),
    albumArt: v.string(),
    album: v.optional(v.string()),
    duration: v.number(),
    userId: v.id("users"),
  },
  returns: v.id("requests"),
  handler: async (ctx, args) => {
    const requestId = await ctx.db.insert("requests", {
      songId: args.songId,
      title: args.title,
      artist: args.artist,
      albumArt: args.albumArt,
      album: args.album,
      duration: args.duration,
      userId: args.userId,
      status: "pending",
    });
    return requestId;
  },
});

// Get requests by user
export const getUserRequests = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("requests")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    // Get user info for username
    const user = await ctx.db.get(args.userId);
    
    return requests.map(req => ({
      ...req,
      username: user?.username || "Unknown",
    }));
  },
});

// Get all requests with user info (for DJ dashboard)
export const getAllRequests = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("requests"),
      _creationTime: v.number(),
      songId: v.string(),
      title: v.string(),
      artist: v.string(),
      albumArt: v.string(),
      album: v.optional(v.string()),
      duration: v.number(),
      userId: v.id("users"),
      username: v.string(),
      userFirstName: v.string(),
      userEmail: v.string(),
      status: v.union(v.literal("pending"), v.literal("approved"), v.literal("played")),
    })
  ),
  handler: async (ctx) => {
    const requests = await ctx.db
      .query("requests")
      .order("desc")
      .take(100);

    // Fetch user info for each request
    const requestsWithUserInfo = await Promise.all(
      requests.map(async (request) => {
        const user = await ctx.db.get(request.userId);
        return {
          _id: request._id,
          _creationTime: request._creationTime,
          songId: request.songId,
          title: request.title,
          artist: request.artist,
          albumArt: request.albumArt,
          album: request.album,
          duration: request.duration,
          userId: request.userId,
          username: user?.username || "Unknown",
          userFirstName: user?.firstName || "Unknown",
          userEmail: user?.email || "unknown@email.com",
          status: request.status,
        };
      })
    );

    return requestsWithUserInfo;
  },
});

// Update request status (for DJ dashboard)
export const updateRequestStatus = mutation({
  args: {
    requestId: v.id("requests"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("played")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.requestId, {
      status: args.status,
    });
    return null;
  },
});

// Delete request (for DJ dashboard)
export const deleteRequest = mutation({
  args: { requestId: v.id("requests") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.requestId);
    return null;
  },
});

// Clear all requests for a user (for listener)
export const clearUserRequests = mutation({
  args: { userId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("requests")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    await Promise.all(requests.map((request) => ctx.db.delete(request._id)));
    return null;
  },
});