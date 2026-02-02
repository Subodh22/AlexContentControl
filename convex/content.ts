import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByConcept = query({
  args: { conceptId: v.id("videoConcepts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("content")
      .withIndex("by_concept", (q) => q.eq("parentConceptId", args.conceptId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("content") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createMany = mutation({
  args: {
    conceptId: v.id("videoConcepts"),
    taskId: v.id("tasks"),
    items: v.array(
      v.object({
        contentType: v.string(),
        titleSuffix: v.string(),
        body: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const concept = await ctx.db.get(args.conceptId);
    if (!concept) throw new Error("Concept not found");

    const now = Date.now();
    const ids: any[] = [];

    for (const it of args.items) {
      const id = await ctx.db.insert("content", {
        createdAt: now,
        updatedAt: now,
        title: `${concept.title} — ${it.titleSuffix}`,
        pillar: concept.pillar,
        contentType: it.contentType as any,
        status: "draft",
        body: it.body,
        blocks: [
          { id: crypto.randomUUID(), type: "heading", text: it.titleSuffix },
          { id: crypto.randomUUID(), type: "paragraph", text: it.body },
        ],
        platforms: [],
        scheduledDate: null,
        publishedDate: null,
        metrics: {
          views: 0,
          impressions: 0,
          engagement: 0,
          clicks: 0,
          conversions: 0,
          engagementRate: 0,
        },
        owner: null,
        parentConceptId: args.conceptId,
        linkedTaskIds: [args.taskId],
      });
      ids.push(id);
    }

    return ids;
  },
});

export const updateBlocks = mutation({
  args: {
    id: v.id("content"),
    blocks: v.array(
      v.object({
        id: v.string(),
        type: v.union(
          v.literal("heading"),
          v.literal("paragraph"),
          v.literal("bullets"),
          v.literal("numbered"),
          v.literal("quote"),
          v.literal("code")
        ),
        text: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { blocks: args.blocks, updatedAt: Date.now() });
  },
});
