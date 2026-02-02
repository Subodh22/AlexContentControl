import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByBoard = query({
  args: { boardId: v.id("boards") },
  handler: async (ctx, args) => {
    const cols = await ctx.db
      .query("columns")
      .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
      .collect();
    return cols.sort((a, b) => a.order - b.order);
  },
});

export const rename = mutation({
  args: { columnId: v.id("columns"), name: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.columnId, { name: args.name });
  },
});
