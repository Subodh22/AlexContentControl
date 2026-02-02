import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByBoard = query({
  args: { boardId: v.id("boards") },
  handler: async (ctx, args) => {
    const cards = await ctx.db
      .query("cards")
      .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
      .collect();
    // Sort by column then order
    return cards.sort((a, b) => {
      if (a.columnId === b.columnId) return a.order - b.order;
      return a.columnId.localeCompare(b.columnId);
    });
  },
});

export const create = mutation({
  args: {
    boardId: v.id("boards"),
    columnId: v.id("columns"),
    title: v.string(),
    description: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Put at end within column
    const existing = await ctx.db
      .query("cards")
      .withIndex("by_column", (q) => q.eq("columnId", args.columnId))
      .collect();
    const maxOrder = existing.reduce((m, c) => Math.max(m, c.order), -1);

    return await ctx.db.insert("cards", {
      boardId: args.boardId,
      columnId: args.columnId,
      title: args.title,
      description: args.description,
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    cardId: v.id("cards"),
    title: v.optional(v.string()),
    description: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const { cardId, ...rest } = args;
    await ctx.db.patch(cardId, { ...rest, updatedAt: Date.now() });
  },
});

export const move = mutation({
  args: {
    cardId: v.id("cards"),
    toColumnId: v.id("columns"),
    toOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const card = await ctx.db.get(args.cardId);
    if (!card) throw new Error("Card not found");

    // Reorder within destination column: naive approach (small scale).
    const dest = await ctx.db
      .query("cards")
      .withIndex("by_column", (q) => q.eq("columnId", args.toColumnId))
      .collect();

    const without = dest.filter((c) => c._id !== args.cardId);
    const clampedOrder = Math.max(0, Math.min(args.toOrder, without.length));

    // Insert placeholder
    const reordered = [...without];
    reordered.splice(clampedOrder, 0, { ...card, columnId: args.toColumnId } as any);

    // Patch orders
    for (let i = 0; i < reordered.length; i++) {
      const c = reordered[i] as any;
      await ctx.db.patch(c._id, {
        columnId: args.toColumnId,
        order: i,
        updatedAt: Date.now(),
      });
    }
  },
});
