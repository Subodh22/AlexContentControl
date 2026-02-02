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

export const createDerivatives = mutation({
  args: {
    conceptId: v.id("videoConcepts"),
    taskId: v.id("tasks"),
    mode: v.union(v.literal("full"), v.literal("research")),
  },
  handler: async (ctx, args) => {
    const concept = await ctx.db.get(args.conceptId);
    if (!concept) throw new Error("Concept not found");

    const now = Date.now();
    const contentIds: any[] = [];

    const make = async (contentType: any, titleSuffix: string, body: string) => {
      const id = await ctx.db.insert("content", {
        createdAt: now,
        updatedAt: now,
        title: `${concept.title} — ${titleSuffix}`,
        pillar: concept.pillar,
        contentType,
        status: "draft",
        body,
        blocks: [
          { id: crypto.randomUUID(), type: "heading", text: titleSuffix },
          { id: crypto.randomUUID(), type: "paragraph", text: body },
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
      contentIds.push(id);
    };

    await make(
      "Research_Doc",
      "Research",
      "TODO: research pack (case studies, stats, tools, competitors)."
    );

    if (args.mode === "full") {
      await make("Hook", "Hooks (8 variants)", "TODO: 8 hook variants.");
      await make("X_Thread", "X Threads (3)", "TODO: 3 threads.");
      await make("Reel", "Reels (4)", "TODO: 4 reel scripts.");
      await make("LinkedIn", "LinkedIn carousel", "TODO: 5-slide carousel.");
      await make("Lead_Magnet", "Lead magnet", "TODO: lead magnet outline.");
      await make(
        "Email_Sequence",
        "Email sequence (5)",
        "TODO: 5-email sequence."
      );
      await make(
        "Discussion",
        "Discussion topics",
        "TODO: 5-7 discussion prompts."
      );
    }

    await ctx.db.patch(args.taskId, {
      linkedContentIds: contentIds,
      completionPercentage: args.mode === "full" ? 30 : 20,
      updatedAt: Date.now(),
    });

    return contentIds;
  },
});
