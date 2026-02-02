import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// MVP: public mutation callable from client + webhook.
// In production you'd restrict this (e.g. require auth and only allow a user to upsert themselves).
export const upsertFromClerk = mutation({
  args: {
    clerkUserId: v.string(),
    email: v.union(v.string(), v.null()),
    name: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkUserId: args.clerkUserId,
      email: args.email,
      name: args.name,
    });
  },
});

export const getMeByClerkUserId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();
  },
});
