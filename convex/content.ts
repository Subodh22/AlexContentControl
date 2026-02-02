import { query } from "./_generated/server";
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
