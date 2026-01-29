import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
* Get all chat messages ordered by creation time (oldest first)
*/
export const getMessages = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("messages"),
      _creationTime: v.number(),
      text: v.string(),
      author: v.string(),
      userId: v.id("users"),
    })
  ),
  handler: async (ctx) => {
    const messages = await ctx.db
      .query("messages")
      .order("asc")
      .collect();

    return messages.map(m => ({
      _id: m._id,
      _creationTime: m._creationTime,
      text: m.text,
      author: m.author,
      userId: m.userId,
    }));
  },
});

/**
* Send a new chat message
*/
export const sendMessage = mutation({
  args: {
    text: v.string(),
    userId: v.id("users"),
  },
  returns: v.id("messages"),
  handler: async (ctx, { text, userId }) => {
    // Get the user to fetch their username
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Create the message
    const messageId = await ctx.db.insert("messages", {
      text: text.trim(),
      author: user.username,
      userId,
    });

    return messageId;
  },
});

/**
* Clear all chat messages (admin/backend function)
*/
export const clearAllMessages = mutation({
  args: {},
  returns: v.object({ count: v.number() }),
  handler: async (ctx) => {
    // Get all messages
    const messages = await ctx.db.query("messages").collect();

    // Delete all messages
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    return { count: messages.length };
  },
});

/**
* Delete a single message (admin function)
*/
export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.messageId);
    return null;
  },
});