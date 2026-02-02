import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    pillar: v.optional(
      v.union(v.literal("AI_Apps"), v.literal("Sales_Entrepreneurship"))
    ),
    status: v.optional(
      v.union(
        v.literal("concept"),
        v.literal("in-production"),
        v.literal("published"),
        v.literal("evergreen")
      )
    ),
  },
  handler: async (ctx, args) => {
    // Simple implementation; can be optimized later.
    const all = await ctx.db.query("videoConcepts").order("desc").collect();
    return all.filter((c) => {
      if (args.pillar && c.pillar !== args.pillar) return false;
      if (args.status && c.status !== args.status) return false;
      return true;
    });
  },
});

export const get = query({
  args: { id: v.id("videoConcepts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    pillar: v.union(v.literal("AI_Apps"), v.literal("Sales_Entrepreneurship")),
    source: v.union(v.literal("telegram"), v.literal("dashboard")),
    sourceRef: v.optional(v.string()),
    outline: v.optional(v.string()),
    keyPoints: v.optional(v.array(v.string())),
    targetAudience: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("videoConcepts", {
      createdAt: now,
      updatedAt: now,
      title: args.title,
      pillar: args.pillar,
      source: args.source,
      sourceRef: args.sourceRef ?? null,
      outline: args.outline ?? null,
      keyPoints: args.keyPoints ?? [],
      targetAudience: args.targetAudience ?? null,
      status: "concept",
      linkedTaskId: null,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("videoConcepts"),
    title: v.optional(v.string()),
    outline: v.optional(v.union(v.string(), v.null())),
    targetAudience: v.optional(v.union(v.string(), v.null())),
    keyPoints: v.optional(v.array(v.string())),
    status: v.optional(
      v.union(
        v.literal("concept"),
        v.literal("in-production"),
        v.literal("published"),
        v.literal("evergreen")
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, { ...rest, updatedAt: Date.now() });
  },
});
