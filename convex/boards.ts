import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listBoards = query({
  args: { ownerUserId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("boards")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", args.ownerUserId))
      .collect();
  },
});

export const createBoard = mutation({
  args: {
    ownerUserId: v.id("users"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const boardId = await ctx.db.insert("boards", {
      ownerUserId: args.ownerUserId,
      name: args.name,
      createdAt: now,
    });

    // Default columns
    await ctx.db.insert("columns", { boardId, name: "Todo", order: 0 });
    await ctx.db.insert("columns", { boardId, name: "Doing", order: 1 });
    await ctx.db.insert("columns", { boardId, name: "Done", order: 2 });

    return boardId;
  },
});
