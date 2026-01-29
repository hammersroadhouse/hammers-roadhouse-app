import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Send a direct message/request to the DJ
 */
export const sendMessageToDJ = mutation({
  args: {
    text: v.string(),
    userId: v.id("users"),
  },
  returns: v.id("djMessages"),
  handler: async (ctx, args) => {
    // Get username
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const messageId = await ctx.db.insert("djMessages", {
      text: args.text.trim(),
      userId: args.userId,
      username: user.username,
      read: false,
    });

    return messageId;
  },
});

/**
 * Get user's sent messages to DJ
 */
export const getUserMessages = query({
  args: { userId: v.id("users") },
  returns: v.array(
    v.object({
      _id: v.id("djMessages"),
      _creationTime: v.number(),
      text: v.string(),
      read: v.boolean(),
    })
  ),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("djMessages")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return messages.map((m) => ({
      _id: m._id,
      _creationTime: m._creationTime,
      text: m.text,
      read: m.read,
    }));
  },
});

/**
 * Get all DJ messages (admin only)
 */
export const getAllDJMessages = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("djMessages"),
      _creationTime: v.number(),
      text: v.string(),
      username: v.string(),
      userId: v.id("users"),
      read: v.boolean(),
    })
  ),
  handler: async (ctx) => {
    const messages = await ctx.db
      .query("djMessages")
      .order("desc")
      .collect();

    return messages.map((m) => ({
      _id: m._id,
      _creationTime: m._creationTime,
      text: m.text,
      username: m.username,
      userId: m.userId,
      read: m.read,
    }));
  },
});

/**
 * Mark message as read
 */
export const markMessageAsRead = mutation({
  args: { messageId: v.id("djMessages") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, { read: true });
    return null;
  },
});

/**
 * Delete DJ message
 */
export const deleteDJMessage = mutation({
  args: { messageId: v.id("djMessages") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.messageId);
    return null;
  },
});

/**
 * Clear all DJ messages
 */
export const clearAllDJMessages = mutation({
  args: {},
  returns: v.object({ count: v.number() }),
  handler: async (ctx) => {
    const messages = await ctx.db.query("djMessages").collect();
    
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
    
    return { count: messages.length };
  },
});