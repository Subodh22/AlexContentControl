import { mutation } from "./_generated/server";
import { v } from "convex/values";

const pillar = v.union(v.literal("AI_Apps"), v.literal("Sales_Entrepreneurship"));

export const telegramInboxAdd = mutation({
  args: {
    chatId: v.string(),
    messageId: v.string(),
    text: v.string(),
    pillar: v.union(pillar, v.null()),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("telegramInbox", {
      chatId: args.chatId,
      messageId: args.messageId,
      text: args.text,
      pillar: args.pillar,
      createdAt: args.createdAt,
      processed: false,
    });
  },
});

export const upsertConceptFromTelegram = mutation({
  args: {
    title: v.string(),
    pillar,
    messageId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    // Naive de-dupe: if a concept already exists for this messageId, return it.
    const existing = await ctx.db
      .query("videoConcepts")
      .withIndex("by_source", (q) => q.eq("source", "telegram"))
      .collect();
    const found = existing.find((c) => c.sourceRef === args.messageId);
    if (found) return found._id;

    return await ctx.db.insert("videoConcepts", {
      createdAt: now,
      updatedAt: now,
      title: args.title,
      pillar: args.pillar,
      source: "telegram",
      sourceRef: args.messageId,
      outline: null,
      keyPoints: [],
      targetAudience: null,
      status: "concept",
      linkedTaskId: null,
    });
  },
});

export const createTask = mutation({
  args: {
    owner: v.string(),
    title: v.string(),
    description: v.union(v.string(), v.null()),
    priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    status: v.union(
      v.literal("not-started"),
      v.literal("in-progress"),
      v.literal("review"),
      v.literal("blocked"),
      v.literal("done")
    ),
    triggerSource: v.union(
      v.literal("telegram"),
      v.literal("dashboard"),
      v.literal("agent_subtask"),
      v.literal("automated_workflow")
    ),
    triggerCommand: v.union(v.string(), v.null()),
    userMessage: v.union(v.string(), v.null()),
    parentTaskId: v.union(v.id("tasks"), v.null()),
    linkedConceptId: v.union(v.id("videoConcepts"), v.null()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("tasks", {
      createdAt: now,
      updatedAt: now,
      owner: args.owner,
      title: args.title,
      description: args.description,
      dueDate: null,
      priority: args.priority,
      status: args.status,
      triggerSource: args.triggerSource,
      triggerCommand: args.triggerCommand,
      userMessage: args.userMessage,
      parentTaskId: args.parentTaskId,
      linkedConceptId: args.linkedConceptId,
      linkedContentIds: [],
      blockers: [],
      completionPercentage: 0,
    });
  },
});

export const updateTaskProgress = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.optional(
      v.union(
        v.literal("not-started"),
        v.literal("in-progress"),
        v.literal("review"),
        v.literal("blocked"),
        v.literal("done")
      )
    ),
    completionPercentage: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { taskId, ...rest } = args;
    await ctx.db.patch(taskId, { ...rest, updatedAt: Date.now() });
  },
});

export const createContent = mutation({
  args: {
    conceptId: v.id("videoConcepts"),
    taskId: v.union(v.id("tasks"), v.null()),
    contentType: v.string(),
    title: v.string(),
    body: v.string(),
    owner: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const concept = await ctx.db.get(args.conceptId);
    if (!concept) throw new Error("Concept not found");

    const now = Date.now();
    const id = await ctx.db.insert("content", {
      createdAt: now,
      updatedAt: now,
      title: args.title,
      pillar: concept.pillar,
      contentType: args.contentType as any,
      status: "draft",
      body: args.body,
      blocks: [
        { id: crypto.randomUUID(), type: "heading", text: args.title },
        { id: crypto.randomUUID(), type: "paragraph", text: args.body },
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
      owner: args.owner,
      parentConceptId: args.conceptId,
      linkedTaskIds: args.taskId ? [args.taskId] : [],
    });

    if (args.taskId) {
      const task = await ctx.db.get(args.taskId);
      if (task) {
        await ctx.db.patch(args.taskId, {
          linkedContentIds: [...task.linkedContentIds, id],
          updatedAt: Date.now(),
        });
      }
    }

    return id;
  },
});
