import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createParent = mutation({
  args: {
    conceptId: v.id("videoConcepts"),
    trigger: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const concept = await ctx.db.get(args.conceptId);
    if (!concept) throw new Error("Concept not found");

    const now = Date.now();
    return await ctx.db.insert("tasks", {
      createdAt: now,
      updatedAt: now,
      owner: "JARVIS",
      title: `Activate: ${concept.title}`,
      description: "Orchestrate content multiplication",
      dueDate: null,
      priority: "high",
      status: "in-progress",
      triggerSource: concept.source === "telegram" ? "telegram" : "dashboard",
      triggerCommand: args.trigger,
      userMessage: null,
      parentTaskId: null,
      linkedConceptId: args.conceptId,
      linkedContentIds: [],
      blockers: [],
      completionPercentage: 10,
    });
  },
});

export const linkTask = mutation({
  args: { conceptId: v.id("videoConcepts"), taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conceptId, {
      linkedTaskId: args.taskId,
      status: "in-production",
      updatedAt: Date.now(),
    });
  },
});

export const setTaskProgress = mutation({
  args: {
    taskId: v.id("tasks"),
    linkedContentIds: v.array(v.id("content")),
    completionPercentage: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, {
      linkedContentIds: args.linkedContentIds,
      completionPercentage: args.completionPercentage,
      updatedAt: Date.now(),
    });
  },
});
