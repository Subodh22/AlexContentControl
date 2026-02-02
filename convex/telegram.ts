import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

const pillar = v.union(v.literal("AI_Apps"), v.literal("Sales_Entrepreneurship"));

// Raw idea inbox from Telegram (stores everything).
export const inboxAdd = mutation({
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

export const inboxList = query({
  args: { chatId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("telegramInbox").order("desc").collect();
    return args.chatId ? all.filter((x) => x.chatId === args.chatId) : all;
  },
});

export const pendingGetByChat = query({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("telegramPending")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .first();
  },
});

export const pendingCreate = mutation({
  args: {
    chatId: v.string(),
    kind: v.union(v.literal("research"), v.literal("generate")),
    conceptTitle: v.string(),
    pillar,
    sourceMessageId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    // Clear old pending for this chat (keep only one outstanding to simplify).
    const existing = await ctx.db
      .query("telegramPending")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();
    for (const p of existing) await ctx.db.delete(p._id);

    return await ctx.db.insert("telegramPending", {
      chatId: args.chatId,
      kind: args.kind,
      conceptTitle: args.conceptTitle,
      pillar: args.pillar,
      sourceMessageId: args.sourceMessageId,
      createdAt: now,
    });
  },
});

export const pendingResolve = action({
  args: {
    chatId: v.string(),
    response: v.union(v.literal("yes"), v.literal("no")),
  },
  handler: async (ctx, args) => {
    const pending = await ctx.runQuery(api.telegram.pendingGetByChat, {
      chatId: args.chatId,
    });

    if (!pending) return { status: "none" as const };

    if (args.response === "no") {
      await ctx.runMutation(api.telegram.pendingDelete, { id: pending._id });
      return { status: "cancelled" as const, kind: pending.kind };
    }

    // YES: create concept + trigger pipeline
    const conceptId = await ctx.runMutation(api.videoConcepts.create, {
      title: pending.conceptTitle,
      pillar: pending.pillar,
      source: "telegram",
      sourceRef: pending.sourceMessageId,
    });

    await ctx.runAction(api.agentPipeline.startGeneration, {
      conceptId,
      mode: pending.kind === "research" ? "research" : "full",
      trigger: `telegram:${pending.sourceMessageId}`,
    });

    await ctx.runMutation(api.telegram.pendingDelete, { id: pending._id });

    return { status: "started" as const, kind: pending.kind, conceptId };
  },
});

export const pendingDelete = mutation({
  args: { id: v.id("telegramPending") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
