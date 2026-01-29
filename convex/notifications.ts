import { mutation } from "./_generated/server";
import { query } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

export const getPushTokenStats = query({
  args: {},
  returns: v.object({
    usersTotal: v.number(),
    usersWithTokens: v.number(),
  }),
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const usersWithTokens = users.filter((u: Doc<"users">) => !!u.pushToken);
    return { usersTotal: users.length, usersWithTokens: usersWithTokens.length };
  },
});

/**
 * Send push notification to all users with registered push tokens
 */
export const sendNotificationToAll = mutation({
  args: {
    title: v.string(),
    body: v.string(),
  },
  returns: v.object({
    sent: v.number(),
    failed: v.number(),
    usersTotal: v.number(),
    usersWithTokens: v.number(),
  }),
  handler: async (ctx, args) => {
    // Get all users with push tokens
    const users = await ctx.db.query("users").collect();
    const usersWithTokens = users.filter((u: Doc<"users">) => u.pushToken);

    if (usersWithTokens.length === 0) {
      return { sent: 0, failed: 0, usersTotal: users.length, usersWithTokens: 0 };
    }

    // Build Expo push notification messages
    const messages = usersWithTokens.map((user: Doc<"users">) => ({
      to: user.pushToken!,
      sound: "default",
      title: args.title,
      body: args.body,
      data: { timestamp: Date.now() },
    }));

    // Send to Expo Push API
    const response = await ctx.fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    if (!response.ok) {
      throw new Error(`Expo Push API error: ${response.status}`);
    }

    const result = await response.json();

    // Count successes and failures
    let sent = 0;
    let failed = 0;

    if (result.data) {
      for (const item of result.data as Array<{ status: string; details?: unknown }>) {
        if (item.status === "ok") {
          sent++;
        } else {
          failed++;
          console.error("Push notification failed:", item);
        }
      }
    }

    return { sent, failed, usersTotal: users.length, usersWithTokens: usersWithTokens.length };
  },
});