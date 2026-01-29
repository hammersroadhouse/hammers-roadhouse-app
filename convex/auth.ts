import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// Generate a 6-digit verification code
function generateVerificationCode(): string {
return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

function normalizeVerificationCode(input: string): string {
  // Users often paste codes with spaces or separators. Keep only digits.
  return input.replace(/\D/g, "").trim();
}

/**
* Register a new user with first name and email
* Sends verification code (in production, this would email the code)
*/
export const register = mutation({
  args: {
    firstName: v.string(),
    username: v.string(),
    email: v.string(),
  },
  returns: v.union(
    v.object({
      ok: v.literal(true),
      userId: v.id("users"),
      verificationCode: v.string(),
    }),
    v.object({
      ok: v.literal(false),
      reason: v.string(),
      message: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const normalizedEmail = normalizeEmail(args.email);
    const normalizedUsername = args.username.trim();

    if (!normalizedUsername) {
      return { ok: false, reason: "USERNAME_REQUIRED", message: "Username is required" };
    }

    // Check if email already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", normalizedEmail))
      .first();

    if (existingUser) {
      return { ok: false, reason: "EMAIL_TAKEN", message: "Email already registered" };
    }

    // Check if username already exists
    const existingUsername = await ctx.db
      .query("users")
      .withIndex("by_username", (q: any) => q.eq("username", normalizedUsername))
      .first();

    if (existingUsername) {
      return { ok: false, reason: "USERNAME_TAKEN", message: "Username already taken" };
    }

    // Generate 6-digit verification code
    const verificationCode = generateVerificationCode();
    const verificationExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Create user
    const userId = await ctx.db.insert("users", {
      firstName: args.firstName.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      emailVerified: false,
      verificationCode,
      verificationExpiry,
    });

    // In production, send email here with verificationCode
    // For now, return it so the app can show it
    return { ok: true, userId, verificationCode };
  },
});

/**
* Verify email with code
*/
export const verifyEmail = mutation({
  args: {
    email: v.string(),
    code: v.string(),
  },
  returns: v.union(
    v.object({
      ok: v.literal(true),
      userId: v.id("users"),
      firstName: v.string(),
      username: v.string(),
      email: v.string(),
    }),
    v.object({
      ok: v.literal(false),
      reason: v.string(),
      message: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const normalizedEmail = normalizeEmail(args.email);
    const normalizedCode = normalizeVerificationCode(args.code);

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", normalizedEmail))
      .unique();

    if (!user) {
      return { ok: false, reason: "NOT_FOUND", message: "No account found for this email." };
    }

    if (user.emailVerified) {
      return {
        ok: true,
        userId: user._id,
        firstName: user.firstName,
        username: user.username,
        email: user.email,
      };
    }

    if (!user.verificationCode) {
      return {
        ok: false,
        reason: "NO_ACTIVE_CODE",
        message: "No active verification code. Tap Resend to get a new one.",
      };
    }

    if (user.verificationExpiry && Date.now() > user.verificationExpiry) {
      return {
        ok: false,
        reason: "EXPIRED",
        message: "Verification code expired. Tap Resend to get a new one.",
      };
    }

    if (normalizedCode.length !== 6) {
      return {
        ok: false,
        reason: "INVALID_FORMAT",
        message: "Please enter the 6-digit verification code.",
      };
    }

    if (normalizeVerificationCode(user.verificationCode) !== normalizedCode) {
      return { ok: false, reason: "INVALID_CODE", message: "Invalid verification code" };
    }

    await ctx.db.patch(user._id, {
      emailVerified: true,
      verificationCode: undefined,
      verificationExpiry: undefined,
    });

    return {
      ok: true,
      userId: user._id,
      firstName: user.firstName,
      username: user.username,
      email: user.email,
    };
  },
});

/**
* Login (check if user exists and is verified)
*/
export const login = query({
  args: {
    email: v.string(),
  },
  returns: v.union(
    v.object({
      userId: v.id("users"),
      firstName: v.string(),
      username: v.string(),
      email: v.string(),
      emailVerified: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const normalizedEmail = normalizeEmail(args.email);

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", normalizedEmail))
      .unique();

    if (!user) {
      return null;
    }

    return {
      userId: user._id,
      firstName: user.firstName,
      username: user.username,
      email: user.email,
      emailVerified: user.emailVerified,
    };
  },
});

/**
* Resend verification code
*/
export const resendVerificationCode = mutation({
  args: {
    email: v.string(),
  },
  returns: v.union(
    v.object({
      ok: v.literal(true),
      verificationCode: v.string(),
    }),
    v.object({
      ok: v.literal(false),
      reason: v.string(),
      message: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const normalizedEmail = normalizeEmail(args.email);

    if (!normalizedEmail) {
      return { ok: false, reason: "EMAIL_REQUIRED", message: "Email is required" };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", normalizedEmail))
      .unique();

    if (!user) {
      // Don't leak whether an email exists in production; for now keep it clear for testing.
      return { ok: false, reason: "NOT_FOUND", message: "No account found for this email." };
    }

    if (user.emailVerified) {
      // Expected case: user already verified.
      return { ok: false, reason: "ALREADY_VERIFIED", message: "Email already verified." };
    }

    const verificationCode = generateVerificationCode();
    const verificationExpiry = Date.now() + 10 * 60 * 1000;

    await ctx.db.patch(user._id, {
      verificationCode,
      verificationExpiry,
    });

    // In production, send email here
    return { ok: true, verificationCode };
  },
});

/**
 * Get user by ID
 */
export const getUser = query({
  args: { userId: v.id("users") },
  returns: v.optional(
    v.object({
      _id: v.id("users"),
      firstName: v.string(),
      username: v.string(),
      email: v.string(),
      avatarColor: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user
      ? {
          _id: user._id,
          firstName: user.firstName,
          username: user.username,
          email: user.email,
          avatarColor: user.avatarColor,
        }
      : null;
  },
});

/**
 * Update user avatar color
 */
export const updateAvatarColor = mutation({
  args: {
    userId: v.id("users"),
    color: v.string(), // hex color code
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      avatarColor: args.color,
    });
    return null;
  },
});

/**
 * Register user's push notification token
 */
export const registerPushToken = mutation({
  args: {
    userId: v.id("users"),
    pushToken: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      pushToken: args.pushToken,
    });

    return null;
  },
});

/**
 * Admin/debug: Count how many users have registered Expo push tokens.
 */
export const getPushTokenStats = query({
  args: {},
  returns: v.object({
    usersTotal: v.number(),
    usersWithTokens: v.number(),
  }),
  handler: async (ctx) => {
    const users: Array<Doc<"users">> = await ctx.db.query("users").collect();
    const usersWithTokens = users.filter(
      (u) => typeof u.pushToken === "string" && u.pushToken.length > 0
    ).length;
    return { usersTotal: users.length, usersWithTokens };
  },
});

/**
 * Admin/internal: Get all Expo push tokens.
 */
export const getAllPushTokens = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const users: Array<Doc<"users">> = await ctx.db.query("users").collect();
    const tokens: Array<string> = [];
    for (const u of users) {
      if (typeof u.pushToken === "string" && u.pushToken.length > 0) tokens.push(u.pushToken);
    }
    return tokens;
  },
});